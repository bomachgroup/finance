import React from 'react';
import { SkeletonTable } from './Skeletons';
import { ErrorState } from './StatePanel';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptySubtitle?: string;
  error?: string;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyTitle,
  emptyMessage = 'No records found',
  emptySubtitle = 'Try adjusting your search query or filters',
  error,
  onRetry,
  onRowClick,
  className = '',
}: TableProps<T>) {
  const displayTitle = emptyTitle || emptyMessage;

  if (loading) {
    return <SkeletonTable rows={5} columns={columns.length} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center bg-surface">
        <p className="text-sm font-semibold text-text">{displayTitle}</p>
        <p className="mt-1 text-xs text-text-3">{emptySubtitle}</p>
      </div>
    );
  }

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs ${className}`}>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-1 text-xs font-bold uppercase tracking-wider text-text-2">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3.5 ${alignClass[col.align || 'left']} ${col.className || ''}`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {data.map((row, index) => (
            <tr
              key={row.id ?? index}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors duration-100 ${
                onRowClick ? 'cursor-pointer hover:bg-surface-1' : 'hover:bg-surface-1/40'
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-text ${alignClass[col.align || 'left']} ${
                    col.className || ''
                  }`}
                >
                  {col.render ? col.render(row, index) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
