import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

const ROWS_PER_PAGE = 8;

const STATUS_STYLES = {
  'In Stock': { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
  'Low Stock': { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
  'Out of Stock': { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
  'Overstocked': { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES['In Stock'];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}

export default function DataGrid({ data }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  // Dynamically build columns based on what data is available
  const hasDrums = data?.some(r => r.drums > 0);
  const hasSupplier = data?.some(r => r.supplier && r.supplier.trim() !== '');

  const columns = [
    { key: 'id', label: 'Item ID', width: '100px' },
    { key: 'name', label: 'Product', width: '140px' },
    ...(hasSupplier
      ? [{ key: 'supplier', label: 'Supplier', width: '140px' }]
      : [{ key: 'category', label: 'Category', width: '100px' }]
    ),
    { key: 'quantity', label: 'Qty', width: '70px' },
    ...(hasDrums ? [{ key: 'drums', label: 'Drums', width: '70px' }] : []),
    { key: 'reorderLevel', label: 'Reorder Lvl', width: '90px' },
    { key: 'totalValue', label: 'Value (₹)', width: '100px' },
    { key: 'status', label: 'Status', width: '110px' },
  ];

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = [...data];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(v =>
          String(v).toLowerCase().includes(q)
        )
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return sortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [data, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const pageData = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (!data || data.length === 0) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden animate-fade-in-up"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 pb-3">
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Inventory Ledger
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} tracked across all warehouses
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }} />
          <input
            id="inventory-search"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl outline-none font-medium border transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border)',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-left font-semibold cursor-pointer select-none group transition-colors"
                  style={{
                    color: 'var(--color-text-muted)',
                    width: col.width,
                    backgroundColor: 'var(--color-bg-tertiary)',
                  }}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr
                key={row.id + i}
                className="transition-colors duration-150"
                style={{ borderBottom: '1px solid var(--color-border)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {columns.map(col => {
                  const val = row[col.key];
                  
                  // ID column
                  if (col.key === 'id') {
                    return (
                      <td key={col.key} className="px-5 py-3 font-mono font-semibold" style={{ color: 'var(--color-accent)' }}>
                        {val}
                      </td>
                    );
                  }
                  
                  // Name/Product column
                  if (col.key === 'name') {
                    return (
                      <td key={col.key} className="px-5 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {val}
                      </td>
                    );
                  }
                  
                  // Quantity column (color-coded)
                  if (col.key === 'quantity') {
                    return (
                      <td key={col.key} className="px-5 py-3 font-bold" style={{
                        color: val <= 0 ? '#EF4444' : val <= row.reorderLevel ? '#F59E0B' : 'var(--color-text-primary)'
                      }}>
                        {val}
                      </td>
                    );
                  }
                  
                  // Value column (₹)
                  if (col.key === 'totalValue') {
                    return (
                      <td key={col.key} className="px-5 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        ₹{Number(val).toLocaleString('en-IN')}
                      </td>
                    );
                  }
                  
                  // Status column (badge)
                  if (col.key === 'status') {
                    return (
                      <td key={col.key} className="px-5 py-3">
                        <StatusBadge status={val} />
                      </td>
                    );
                  }
                  
                  // Default text column
                  return (
                    <td key={col.key} className="px-5 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Page {page + 1} of {totalPages || 1}
        </p>
        <div className="flex items-center gap-2">
          <button
            id="grid-prev-page"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-lg border cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-bg-tertiary)',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            id="grid-next-page"
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded-lg border cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-bg-tertiary)',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
