// ── File Parser Utility ──────────────────────────────────────
// Parses Excel (.xlsx/.xls), CSV, and PDF files into structured rows.

import * as XLSX from 'xlsx';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// ── Polyfills for Older Mobile Browsers ───────────────────────
if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

if (!Object.values) {
  Object.values = function (obj) {
    return Object.keys(obj).map(key => obj[key]);
  };
}

// ── Excel / CSV Parser ───────────────────────────────────────
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to array of objects (first row = headers)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        if (!jsonData || jsonData.length === 0) {
          reject(new Error('No data found in the file. Make sure the first row contains column headers.'));
          return;
        }
        
        const headers = Object.keys(jsonData[0]);
        resolve({ rows: jsonData, headers, sheetName });
      } catch (err) {
        reject(new Error(`Failed to parse Excel file: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsArrayBuffer(file);
  });
}

// ── PDF Parser (Robust Table Extraction) ─────────────────────
export async function parsePdfFile(file) {
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        
        // ── Step 1: Extract all text items from all pages ─────
        const allItems = [];
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          textContent.items.forEach(item => {
            if (!item || typeof item.str !== 'string') return;
            const text = item.str.trim();
            if (text.length === 0) return;
            
            allItems.push({
              text,
              x: Math.round(item.transform[4]),
              y: Math.round(item.transform[5]),
              width: Math.round(item.width || 0),
              page: pageNum,
            });
          });
        }
        
        if (allItems.length < 5) {
          reject(new Error('Too little text found in PDF. Try converting to Excel (.xlsx) for better results.'));
          return;
        }
        
        // ── Step 2: Group items into rows using Y-position binning ─
        // PDF text items in the same visual row can have slightly different Y values.
        // We bin them with a tolerance of 4px.
        const Y_TOLERANCE = 4;
        
        // Sort all items by page then by Y (descending = top-first in PDF coords)
        allItems.sort((a, b) => {
          if (a.page !== b.page) return a.page - b.page;
          return b.y - a.y; // top to bottom
        });
        
        const rows = [];
        let currentRow = [allItems[0]];
        let currentY = allItems[0].y;
        let currentPage = allItems[0].page;
        
        for (let i = 1; i < allItems.length; i++) {
          const item = allItems[i];
          
          // Same row if same page AND Y is within tolerance
          if (item.page === currentPage && Math.abs(item.y - currentY) <= Y_TOLERANCE) {
            currentRow.push(item);
          } else {
            // Save current row and start new one
            if (currentRow.length > 0) {
              // Sort items in row by X position (left to right)
              currentRow.sort((a, b) => a.x - b.x);
              rows.push(currentRow);
            }
            currentRow = [item];
            currentY = item.y;
            currentPage = item.page;
          }
        }
        // Don't forget the last row
        if (currentRow.length > 0) {
          currentRow.sort((a, b) => a.x - b.x);
          rows.push(currentRow);
        }
        
        // ── Step 3: Find the table header row ────────────────────
        // Look for a row that contains known inventory column names.
        const HEADER_KEYWORDS = [
          'item', 'product', 'name', 'material', 'particulars', 'description',
          'qty', 'quantity', 'stock', 'supplier', 'vendor',
          'drums', 'lot', 'age', 'rate', 'price', 'amount',
          'sr', 'no', 'unit', 'uom', 'category', 'status',
        ];
        
        let headerIdx = -1;
        let bestScore = 0;
        
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < 3) continue; // Need at least 3 columns to be a table header
          
          // Score this row: how many cells match known header keywords?
          let score = 0;
          const joinedLower = row.map(r => r.text).join(' ').toLowerCase();
          
          HEADER_KEYWORDS.forEach(kw => {
            if (joinedLower.includes(kw)) score++;
          });
          
          // Also boost score if the row has a good number of columns (4+)
          if (row.length >= 4) score += 2;
          if (row.length >= 6) score += 2;
          
          if (score > bestScore) {
            bestScore = score;
            headerIdx = i;
          }
        }
        
        if (headerIdx === -1 || bestScore < 3) {
          // Fallback: try to find any row with 4+ columns as header
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].length >= 4) {
              headerIdx = i;
              break;
            }
          }
        }
        
        if (headerIdx === -1) {
          reject(new Error('Could not find a table header in the PDF. Try converting to Excel (.xlsx) format.'));
          return;
        }
        
        // ── Step 4: Build column headers ─────────────────────────
        const headerRow = rows[headerIdx];
        const H_sorted = [...headerRow].sort((a, b) => a.x - b.x);
        const headers = H_sorted.map(h => h.text);
        
        // Compute column boundaries (midpoints between consecutive columns)
        const boundaries = [];
        for (let i = 0; i < H_sorted.length - 1; i++) {
          const rightEdge = H_sorted[i].x + H_sorted[i].width;
          const nextLeftEdge = H_sorted[i+1].x;
          boundaries.push((rightEdge + nextLeftEdge) / 2);
        }
        
        function getColumnIndexForX(x) {
          for (let i = 0; i < boundaries.length; i++) {
            if (x < boundaries[i]) return i;
          }
          return boundaries.length;
        }
        
        // ── Step 5: Extract data rows ────────────────────────────
        const dataRows = [];
        
        for (let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length === 0) continue;
          
          // Filter out rows that are likely headers, addresses, or footers
          const joinedLower = row.map(r => r.text).join(' ').toLowerCase();
          
          // Skip rows that look like page number footers or totals
          if (joinedLower.includes('total') && row.length < 4) continue;
          if (joinedLower.includes('grand total')) continue;
          if (joinedLower.includes('page ') && joinedLower.includes(' of ')) continue;
          
          // Skip header row repeats
          if (joinedLower.includes('item name') && joinedLower.includes('supplier')) continue;
          
          // Build row object
          const obj = {};
          headers.forEach(h => {
            obj[h] = '';
          });
          
          row.forEach(item => {
            // Split item by space in case multiple columns are merged
            const parts = item.text.split(/\s+/);
            if (parts.length > 1) {
              let currentX = item.x;
              parts.forEach((part) => {
                const partWidth = part.length * 6; // approximate char width
                const colIndex = getColumnIndexForX(currentX); // use start X of part
                const headerName = headers[colIndex];
                if (headerName) {
                  obj[headerName] = obj[headerName] ? obj[headerName] + ' ' + part : part;
                }
                currentX += partWidth + 6;
              });
            } else {
              const colIndex = getColumnIndexForX(item.x); // use start X of item
              const headerName = headers[colIndex];
              if (headerName) {
                obj[headerName] = obj[headerName] ? obj[headerName] + ' ' + item.text : item.text;
              }
            }
          });
          
          // Check if this row actually has any non-empty data
          const hasData = Object.values(obj).some(val => val !== '');
          if (hasData) {
            dataRows.push(obj);
          }
        }
        
        if (dataRows.length === 0) {
          reject(new Error(`Found header row (${headers.join(', ')}) but no data rows. The PDF table structure may be complex — try converting to Excel (.xlsx).`));
          return;
        }
        
        console.log(`[PDF Parser] Found ${dataRows.length} data rows with ${headers.length} columns: ${headers.join(', ')}`);
        
        resolve({ rows: dataRows, headers, sheetName: 'PDF' });
      } catch (err) {
        console.error('PDF parse error:', err);
        reject(new Error(`Failed to parse PDF: ${err.message}. Try converting to Excel (.xlsx) format.`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the PDF file.'));
    reader.readAsArrayBuffer(file);
  });
}

// ── Main parser ──────────────────────────────────────────────
export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return await parseExcelFile(file);
  } else if (ext === 'pdf') {
    return await parsePdfFile(file);
  } else {
    throw new Error(`Unsupported file type: .${ext}`);
  }
}
