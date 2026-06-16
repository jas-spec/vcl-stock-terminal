import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, RefreshCw } from 'lucide-react';

const ROWS_PER_PAGE = 8;

const STATUS_STYLES = {
  Completed: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
  Pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
  Processing: { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' },
};

const COLUMN_LABELS = {
  id: 'Transaction ID',
  time: 'Time Stamp',
  trader: 'Trader Entity',
  type: 'Order Type',
  region: 'Region',
  amount: 'Amount (USD)',
  quantity: 'Qty',
  status: 'Status',
};

export default function DataGrid({ data }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('time');
  const [sortDir, setSortDir] = useState('desc');

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter(k => k !== 'prevPrice' && k !== 'priceDirection');
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      Object.entries(row).some(([key, val]) =>
        key !== 'prevPrice' && key !== 'priceDirection' && String(val).toLowerCase().includes(q)
      )
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  
  // Safe page indexing
  const currentPage = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return sorted.slice(start, start + ROWS_PER_PAGE);
  }, [sorted, currentPage]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131825]">
        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-slate-400" />
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
          Awaiting live transaction data stream...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden animate-fade-in-up"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5"
        style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Order Book & Transaction Ledger
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Showing {filtered.length} of {data.length} active transactions
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }} />
          <input
            id="data-grid-search"
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm font-medium outline-none transition-all duration-200"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.boxShadow = 'var(--shadow-glow)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              {columns.map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3 cursor-pointer select-none transition-colors duration-200"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                >
                  <div className="flex items-center gap-1.5">
                    {COLUMN_LABELS[col] || col}
                    <ArrowUpDown size={12} className={sortKey === col ? 'opacity-100' : 'opacity-30'} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="transition-colors duration-150 animate-fade-in"
                style={{ borderBottom: '1px solid var(--color-border)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {columns.map(col => (
                  <td key={col} className="px-5 py-3.5 text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    {col === 'status' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{
                          backgroundColor: STATUS_STYLES[row[col]]?.bg || 'var(--color-bg-tertiary)',
                          color: STATUS_STYLES[row[col]]?.color || 'var(--color-text-secondary)',
                        }}>
                        {row[col]}
                      </span>
                    ) : col === 'amount' ? (
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        ${Number(row[col]).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    ) : col === 'id' ? (
                      <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
                        {row[col]}
                      </span>
                    ) : (
                      row[col]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            id="data-grid-prev"
            disabled={currentPage <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className="w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: currentPage === pageNum ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                  color: currentPage === pageNum ? '#FFFFFF' : 'var(--color-text-secondary)',
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            id="data-grid-next"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-2 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
