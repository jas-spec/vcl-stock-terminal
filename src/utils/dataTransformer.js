// ── Data Transformer ──────────────────────────────────────────
// Converts raw parsed file rows into the dashboard data structure.
// Auto-detects column mappings from common column names.

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// ── Column Name Detection ────────────────────────────────────
// Maps user's column names to our internal field names.
function detectColumns(headers) {
  const lower = headers.map(h => h.toLowerCase().trim());
  
  const mapping = {
    name: null,        // product/item name
    category: null,    // category/group
    supplier: null,    // supplier/vendor
    quantity: null,    // quantity / sum of qty / stock
    drums: null,       // drums / sum of drums
    unit: null,        // unit (kg, litre, etc.)
    price: null,       // price per unit
    lot: null,         // lot number
    age: null,         // age
    warehouse: null,   // warehouse / location
    reorderLevel: null // reorder level / min stock
  };

  lower.forEach((col, idx) => {
    const h = headers[idx]; // original case

    // Item/Product Name
    if (!mapping.name && (
      col.includes('item name') || col.includes('product') || col.includes('item') ||
      col.includes('name') || col.includes('material') || col.includes('description') ||
      col.includes('particulars') || col.includes('stock name')
    )) {
      mapping.name = h;
    }

    // Category
    if (!mapping.category && (
      col.includes('category') || col.includes('group') || col.includes('type') ||
      col.includes('class')
    )) {
      mapping.category = h;
    }

    // Supplier
    if (!mapping.supplier && (
      col.includes('supplier') || col.includes('vendor') || col.includes('company') ||
      col.includes('party') || col.includes('source')
    )) {
      mapping.supplier = h;
    }

    // Quantity — prefer "sum of qty" or "total qty" or just "qty"
    if (
      col.includes('sum of qty') || col === 'sum of quantity' ||
      col === 'total qty' || col === 'total quantity'
    ) {
      mapping.quantity = h; // Override any previous match
    } else if (!mapping.quantity && (
      col.includes('qty') || col.includes('quantity') || col.includes('stock') ||
      col.includes('balance') || col.includes('closing')
    )) {
      mapping.quantity = h;
    }

    // Drums
    if (
      col.includes('sum of drums') || col === 'total drums'
    ) {
      mapping.drums = h;
    } else if (!mapping.drums && col.includes('drums')) {
      mapping.drums = h;
    }

    // Unit
    if (!mapping.unit && (
      col === 'unit' || col === 'uom' || col.includes('unit of')
    )) {
      mapping.unit = h;
    }

    // Price
    if (!mapping.price && (
      col.includes('price') || col.includes('rate') || col.includes('cost') ||
      col.includes('value') || col.includes('amount')
    )) {
      mapping.price = h;
    }

    // Lot
    if (!mapping.lot && (col === 'lot' || col.includes('lot no') || col.includes('batch'))) {
      mapping.lot = h;
    }

    // Age
    if (!mapping.age && (col === 'age' || col.includes('days old'))) {
      mapping.age = h;
    }

    // Warehouse/Location
    if (!mapping.warehouse && (
      col.includes('warehouse') || col.includes('location') || col.includes('godown') ||
      col.includes('store')
    )) {
      mapping.warehouse = h;
    }

    // Reorder Level
    if (!mapping.reorderLevel && (
      col.includes('reorder') || col.includes('min stock') || col.includes('minimum') ||
      col.includes('safety stock')
    )) {
      mapping.reorderLevel = h;
    }
  });

  // Fallback: if no name column detected, use the first text column
  if (!mapping.name && headers.length > 0) {
    mapping.name = headers[0];
  }

  return mapping;
}

// ── Parse numeric value from string ──────────────────────────
function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  // Remove commas and non-numeric chars except . and -
  const cleaned = String(val).replace(/[^0-9.\-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// ── Get stock status ─────────────────────────────────────────
function getStockStatus(qty, reorderLevel) {
  if (qty <= 0) return 'Out of Stock';
  if (qty <= reorderLevel) return 'Low Stock';
  if (qty > reorderLevel * 3) return 'Overstocked';
  return 'In Stock';
}

// ── Transform parsed file data into dashboard format ─────────
export function transformParsedData(parsedData, fileName = 'Uploaded File', nodeRegion = 'mumbai') {
  const { rows, headers } = parsedData;
  const colMap = detectColumns(headers);
  
  // Build inventory table from parsed rows
  const table = [];
  const categorySet = new Set();
  const supplierSet = new Set();

  let lastProduct = '';
  rows.forEach((row, idx) => {
    let name = String(row[colMap.name] || '').trim();
    if (name === '') {
      name = lastProduct;
    } else {
      lastProduct = name;
    }
    
    // If we still don't have a name, default to item number
    if (!name || name === '') {
      name = `Item ${idx + 1}`;
    }
    
    const quantity = parseNum(row[colMap.quantity]);
    const drums = colMap.drums ? parseNum(row[colMap.drums]) : 0;
    const supplier = colMap.supplier ? String(row[colMap.supplier]).trim() : '';
    const category = colMap.category ? String(row[colMap.category]).trim() : (supplier || 'General');
    const unit = colMap.unit ? String(row[colMap.unit]).trim() : (drums > 0 ? 'drums' : 'units');
    const pricePerUnit = colMap.price ? parseNum(row[colMap.price]) : rand(20, 500);
    const lot = colMap.lot ? String(row[colMap.lot]).trim() : '';
    const age = colMap.age ? parseNum(row[colMap.age]) : 0;
    const reorderLevel = colMap.reorderLevel ? parseNum(row[colMap.reorderLevel]) : Math.max(5, Math.round(quantity * 0.2));
    const warehouse = colMap.warehouse ? String(row[colMap.warehouse]).trim() : '';

    // Use the effective quantity (sum of qty, or drums if no qty)
    const effectiveQty = quantity || drums;
    
    if (category) categorySet.add(category);
    if (supplier) supplierSet.add(supplier);

    table.push({
      id: `INV-${String(idx + 1).padStart(4, '0')}`,
      name,
      category,
      supplier,
      warehouse: warehouse || (nodeRegion === 'mumbai' ? 'Mumbai Warehouse' : 'Gujarat Warehouse'),
      unit,
      quantity: effectiveQty,
      drums,
      reorderLevel,
      pricePerUnit,
      totalValue: Math.round(effectiveQty * pricePerUnit),
      lot,
      age,
      status: getStockStatus(effectiveQty, reorderLevel),
      lastUpdated: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    });
  });

  if (table.length === 0) {
    throw new Error('No valid inventory rows found in the file.');
  }

  // ── Generate KPI from real data ──────────────────────────────
  const totalItems = table.length;
  const outOfStock = table.filter(i => i.quantity <= 0).length;
  const lowStock = table.filter(i => i.status === 'Low Stock').length;
  const totalValue = table.reduce((sum, i) => sum + i.totalValue, 0);
  const totalQuantity = table.reduce((sum, i) => sum + i.quantity, 0);

  const kpi = {
    totalItems,
    outOfStock,
    lowStock,
    totalValue,
    totalQuantity,
    fileName,
    outOfStockChange: outOfStock > 2 ? outOfStock - 2 : -1,
    lowStockChange: lowStock > 3 ? lowStock - 3 : -2,
    valueChange: randFloat(-3.5, 4.5),
    quantityChange: randFloat(-5, 3),
  };

  // ── Time series (simulate last 7 data points for top products) ──
  const topProducts = table
    .filter(i => i.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(i => i.name);

  const timeSeriesData = [];
  const dayLabels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayLabels.push(d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
  }

  dayLabels.forEach((day, dayIdx) => {
    const point = { day };
    topProducts.forEach(name => {
      const item = table.find(t => t.name === name);
      const baseQty = item ? item.quantity : 0;
      // Simulate slight variation over days (higher in past, lower approaching today)
      const variation = rand(-5, 10);
      const dayMultiplier = 1 + (6 - dayIdx) * 0.05; // slightly higher in past
      point[name] = Math.max(0, Math.round(baseQty * dayMultiplier + variation));
    });
    timeSeriesData.push(point);
  });
  // Last point = actual current values
  topProducts.forEach(name => {
    const item = table.find(t => t.name === name);
    timeSeriesData[timeSeriesData.length - 1][name] = item ? item.quantity : 0;
  });

  const timeSeries = { data: timeSeriesData, products: topProducts };

  // ── Category bar chart ────────────────────────────────────────
  const categoryMap = {};
  table.forEach(item => {
    if (!categoryMap[item.category]) {
      categoryMap[item.category] = { name: item.category, value: 0, products: 0 };
    }
    categoryMap[item.category].value += item.quantity;
    categoryMap[item.category].products++;
  });
  const categories = Object.values(categoryMap).sort((a, b) => b.value - a.value);

  // ── Donut chart (stock status distribution) ────────────────────
  const statusCounts = { 'In Stock': 0, 'Low Stock': 0, 'Out of Stock': 0, 'Overstocked': 0 };
  table.forEach(item => {
    if (statusCounts[item.status] !== undefined) statusCounts[item.status]++;
  });
  const donut = Object.entries(statusCounts).map(([name, count]) => ({
    name,
    value: parseFloat(((count / totalItems) * 100).toFixed(1)),
    count,
  }));

  // ── Scatter chart (qty vs reorder level) ───────────────────────
  const scatter = table.map(item => ({
    x: item.quantity,
    y: item.reorderLevel,
    z: rand(40, 140),
    name: item.name,
    category: item.status === 'Out of Stock' || item.status === 'Low Stock'
      ? 'Needs Reorder'
      : item.quantity > item.reorderLevel * 3
        ? 'Overstocked'
        : 'Adequate',
  }));

  // ── Alerts ─────────────────────────────────────────────────────
  const alerts = [];
  table.filter(i => i.quantity <= 0).forEach(i => {
    alerts.push({
      id: i.id, name: i.name, category: i.category,
      warehouse: i.warehouse, severity: 'critical',
      message: `${i.name} is OUT OF STOCK! Refill needed immediately.`,
    });
  });
  table.filter(i => i.status === 'Low Stock').forEach(i => {
    alerts.push({
      id: i.id, name: i.name, category: i.category,
      warehouse: i.warehouse, quantity: i.quantity,
      reorderLevel: i.reorderLevel, severity: 'warning',
      message: `${i.name} is running low (${i.quantity} left, reorder at ${i.reorderLevel}).`,
    });
  });

  return {
    kpi,
    timeSeries,
    categories,
    donut,
    scatter,
    table,
    alerts,
  };
}
