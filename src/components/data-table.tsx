import React, { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Button } from "./ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

type SortDirection = "asc" | "desc"

export type ColumnDef<T> = {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
  headerClassName?: string
  cellClassName?: string
  headerNode?: React.ReactNode
}

type ServerSort = { key: string; dir: SortDirection }

type DataTableProps<T> = {
  data: T[]
  columns: ColumnDef<T>[]
  emptyMessage?: string
  loading?: boolean

  serverSide?: boolean
  total?: number
  page?: number
  pageSize?: number
  sort?: ServerSort
  onPageChange?: (p: number) => void
  onPageSizeChange?: (n: number) => void
  onSortChange?: (s: ServerSort) => void

  toolbarRight?: React.ReactNode
  pageSizeOptions?: number[]
  defaultPageSize?: number
}

function HeaderSort({
  active,
  dir,
  onAsc,
  onDesc,
}: {
  active: boolean
  dir: SortDirection
  onAsc: () => void
  onDesc: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        className={`rounded p-1 hover:bg-muted cursor-pointer ${active && dir === "asc" ? "bg-muted" : ""}`}
        onClick={onAsc}
        aria-label="sort asc"
      >
        <ChevronUp className="size-3" />
      </button>
      <button
        type="button"
        className={`rounded p-1 hover:bg-muted cursor-pointer ${active && dir === "desc" ? "bg-muted" : ""}`}
        onClick={onDesc}
        aria-label="sort desc"
      >
        <ChevronDown className="size-3" />
      </button>
    </span>
  )
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  emptyMessage = "No hay datos para mostrar",
  loading = false,

  serverSide = false,
  total = 0,
  page = 1,
  pageSize = 10,
  sort = { key: "createdAt", dir: "desc" },
  onPageChange,
  onPageSizeChange,
  onSortChange,

  toolbarRight,
  pageSizeOptions = [5, 10, 20],
  defaultPageSize = 10,
}: DataTableProps<T>) {
  const safeData = Array.isArray(data) ? data : []

  const [localPageSize, setLocalPageSize] = useState(defaultPageSize)

  useEffect(() => {
    if (!serverSide) setLocalPageSize(defaultPageSize)
  }, [serverSide, defaultPageSize])

  const effectivePageSize = serverSide ? pageSize : localPageSize

  const totalItems = serverSide ? total : safeData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize))
  const currentPage = Math.min(page, totalPages)

  const pageData = useMemo(() => {
    if (serverSide) return safeData
    const start = (currentPage - 1) * effectivePageSize
    const end = start + effectivePageSize
    return safeData.slice(start, end)
  }, [serverSide, safeData, currentPage, effectivePageSize])

  const from = totalItems === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1
  const to = totalItems === 0 ? 0 : from + pageData.length - 1

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        {toolbarRight}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => {
                const isSortable = !!col.sortable && serverSide
                const active = sort.key === String(col.key)
                return (
                  <TableHead key={String(col.key)} className={col.headerClassName}>
                    {col.headerNode ? (
                      col.headerNode
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{col.header}</span>
                        {isSortable && (
                          <HeaderSort
                            active={active}
                            dir={sort.dir}
                            onAsc={() => onSortChange?.({ key: String(col.key), dir: "asc" })}
                            onDesc={() => onSortChange?.({ key: String(col.key), dir: "desc" })}
                          />
                        )}
                      </div>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <span className="text-sm text-muted-foreground">Cargando…</span>
                </TableCell>
              </TableRow>
            ) : pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <span className="text-sm text-muted-foreground">{emptyMessage}</span>
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((row, idx) => (
                <TableRow key={row?._id ?? idx}>
                  {columns.map(col => (
                    <TableCell key={String(col.key)} className={col.cellClassName}>
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <span className="text-sm text-muted-foreground">
            Mostrando {from}–{to} de {totalItems}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filas por página</span>
            <Select
              value={String(effectivePageSize)}
              onValueChange={val => {
                const n = Number(val)
                if (serverSide) onPageSizeChange?.(n)
                else setLocalPageSize(n)
              }}
            >
              <SelectTrigger className="w-[90px] cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(opt => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || !serverSide}
          >
            Anterior
          </Button>

          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || !serverSide}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
