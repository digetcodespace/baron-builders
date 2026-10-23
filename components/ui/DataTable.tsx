"use client";

import type { ReactNode } from "react";
import { Checkbox } from "./Checkbox";
import { EmptyState } from "./EmptyState";
import { Icon } from "./Icon";
import { Skeleton } from "./Skeleton";

export interface Column<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right";
  /** Tailwind width class, e.g. "w-40". */
  width?: string;
}

export interface SortState {
  columnId: string;
  direction: "asc" | "desc";
}

export interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (keys: string[]) => void;
  loading?: boolean;
  empty?: ReactNode;
  className?: string;
}

/**
 * Presentation only: sorting and paging are decided by the caller (the server
 * orders by cursor). Place the list's pagination sentinel right after the table.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  sort,
  onSortChange,
  onRowClick,
  selectable = false,
  selected = [],
  onSelectedChange,
  loading = false,
  empty,
  className = "",
}: DataTableProps<T>) {
  const keys = rows.map(rowKey);
  const allSelected = keys.length > 0 && keys.every((k) => selected.includes(k));
  const someSelected = keys.some((k) => selected.includes(k));

  const toggleAll = () => onSelectedChange?.(allSelected ? selected.filter((k) => !keys.includes(k)) : Array.from(new Set([...selected, ...keys])));
  const toggleOne = (key: string) =>
    onSelectedChange?.(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);

  if (!loading && rows.length === 0 && empty) return <>{empty}</>;
  const colSpan = columns.length + (selectable ? 1 : 0);

  return (
    <div className={`overflow-hidden rounded-lg border border-border bg-surface shadow-low ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 z-[var(--z-sticky)] bg-n-50">
            <tr className="border-b border-border">
              {selectable ? (
                <th scope="col" className="w-12 px-4 py-3">
                  <Checkbox
                    label={<span className="sr-only">Select all rows</span>}
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onChange={toggleAll}
                  />
                </th>
              ) : null}
              {columns.map((column) => {
                const active = sort?.columnId === column.id;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                    className={`px-4 py-3 t-label text-n-600 ${column.align === "right" ? "text-right" : ""} ${column.width ?? ""}`}
                  >
                    {column.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() =>
                          onSortChange({ columnId: column.id, direction: active && sort.direction === "asc" ? "desc" : "asc" })
                        }
                        className={`group/sort inline-flex items-center gap-1 uppercase tracking-[inherit] transition-colors hover:text-text ${active ? "text-text" : ""}`}
                      >
                        {column.header}
                        <Icon
                          name="chevron-up"
                          size={14}
                          className={`transition-[transform,translate,scale,rotate,opacity] duration-[var(--dur-base)] ease-[var(--ease-spring)] ${active ? "opacity-100" : "opacity-0 group-hover/sort:opacity-40"} ${active && sort.direction === "desc" ? "rotate-180" : ""}`}
                        />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }, (_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-border last:border-0">
                    <td colSpan={colSpan} className="px-4 py-3.5">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              : rows.map((row) => {
                  const key = rowKey(row);
                  const isSelected = selected.includes(key);
                  return (
                    <tr
                      key={key}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      data-selected={isSelected || undefined}
                      className={`group/row border-b border-border transition-colors duration-[var(--dur-base)] ease-[var(--ease-smooth)] last:border-0 hover:bg-n-50 data-[selected]:bg-primary-soft ${onRowClick ? "cursor-pointer" : ""}`}
                    >
                      {selectable ? (
                        <td className="w-12 px-4 py-3.5" onClick={(event) => event.stopPropagation()}>
                          <Checkbox label={<span className="sr-only">Select row</span>} checked={isSelected} onChange={() => toggleOne(key)} />
                        </td>
                      ) : null}
                      {columns.map((column) => (
                        <td key={column.id} className={`whitespace-nowrap px-4 py-3.5 t-ui ${column.align === "right" ? "text-right" : ""}`}>
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { EmptyState };
