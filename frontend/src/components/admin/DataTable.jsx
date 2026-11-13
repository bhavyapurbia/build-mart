import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Download, AlertCircle } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchable = true,
  searchKeys = [],
  exportFilename = 'export',
  title = '',
  actions = null,
  initialPageSize = 10,
  emptyMessage = 'No records found'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Sorting handler
  const handleSort = (columnKey) => {
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  // Filtered data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter(item => {
      if (searchKeys.length > 0) {
        return searchKeys.some(key => {
          const val = key.split('.').reduce((obj, k) => obj?.[k], item);
          return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
        });
      }
      return Object.values(item).some(val => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(term);
        }
        return false;
      });
    });
  }, [data, searchTerm, searchKeys]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const getVal = (obj, key) => {
        if (typeof key === 'function') return key(obj);
        return key.split('.').reduce((o, k) => o?.[k], obj);
      };

      const valA = getVal(a, sortConfig.key);
      const valB = getVal(b, sortConfig.key);

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginated data
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // CSV Export
  const exportToCSV = () => {
    if (!sortedData.length) return;

    const headers = columns.map(c => `"${(c.header || '').replace(/"/g, '""')}"`).join(',');
    const rows = sortedData.map(item => {
      return columns.map(col => {
        let val;
        if (typeof col.accessor === 'function') {
          val = col.accessor(item);
        } else if (typeof col.accessor === 'string') {
          val = col.accessor.split('.').reduce((o, k) => o?.[k], item);
        }
        if (val === undefined || val === null) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFilename}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card, #FFFFFF)',
      borderRadius: '12px',
      border: '1px solid var(--border-light, #E5E7EB)',
      boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
      overflow: 'hidden'
    }}>
      {/* Top Header / Toolbar */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid var(--border-light, #E5E7EB)'
      }}>
        <div>
          {title && <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{title}</h2>}
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Showing {sortedData.length} records
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {searchable && (
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search table..."
                aria-label="Search table"
                style={{
                  padding: '7px 12px 7px 32px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light, #D1D5DB)',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: '220px'
                }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={exportToCSV}
            disabled={!sortedData.length}
            className="btn-secondary"
            style={{
              padding: '7px 12px',
              fontSize: '12.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: sortedData.length ? 'pointer' : 'not-allowed',
              opacity: sortedData.length ? 1 : 0.6
            }}
            title="Export CSV"
          >
            <Download size={14} /> Export CSV
          </button>

          {actions}
        </div>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-main, #F9FAFB)', borderBottom: '1px solid var(--border-light, #E5E7EB)' }}>
              {columns.map((col, idx) => {
                const isSorted = sortConfig.key === (col.sortKey || col.accessor);
                return (
                  <th
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      width: col.width || 'auto'
                    }}
                    onClick={() => col.sortable && handleSort(col.sortKey || col.accessor)}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span>
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                          ) : (
                            <ArrowUpDown size={13} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(pageSize)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-light, #F3F4F6)' }}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} style={{ padding: '16px' }}>
                      <div style={{ height: '16px', backgroundColor: '#E5E7EB', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <AlertCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <div>{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => (
                <tr
                  key={row._id || row.id || rIdx}
                  style={{
                    borderBottom: '1px solid var(--border-light, #F3F4F6)',
                    backgroundColor: rIdx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                  }}
                >
                  {columns.map((col, cIdx) => {
                    let cellVal;
                    if (typeof col.render === 'function') {
                      cellVal = col.render(row, rIdx);
                    } else if (typeof col.accessor === 'function') {
                      cellVal = col.accessor(row);
                    } else if (typeof col.accessor === 'string') {
                      cellVal = col.accessor.split('.').reduce((o, k) => o?.[k], row);
                    }
                    return (
                      <td key={cIdx} style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        {cellVal !== undefined && cellVal !== null ? cellVal : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderTop: '1px solid var(--border-light, #E5E7EB)',
        backgroundColor: 'var(--bg-main, #F9FAFB)',
        fontSize: '12.5px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid var(--border-light, #D1D5DB)',
              background: '#FFFFFF',
              fontSize: '12px',
              outline: 'none'
            }}
          >
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-light, #D1D5DB)',
              backgroundColor: currentPage <= 1 ? '#F3F4F6' : '#FFFFFF',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-light, #D1D5DB)',
              backgroundColor: currentPage >= totalPages ? '#F3F4F6' : '#FFFFFF',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            aria-label="Next page"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

