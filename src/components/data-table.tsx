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
import { Input } from "./ui/input"
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

type ControlledSort<T> = {
  key: keyof T | null
  dir: SortDirection
}

type DataTableProps<T> = {
  data: T[]
  columns: ColumnDef<T>[]
  searchableKeys?: (keyof T)[]
  searchPlaceholder?: string
  pageSizeOptions?: number[]
  defaultPageSize?: number
  emptyMessage?: string
  loading?: boolean

  serverSide?: boolean

  total?: number
  page?: number
  pageSize?: number
  searchValue?: string
  sort?: ControlledSort<T>

  onSearchChange?: (val: string) => void
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onSortChange?: (sort: ControlledSort<T>) => void
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchableKeys,
  searchPlaceholder = "Buscar...",
  pageSizeOptions = [5, 10, 20],
  defaultPageSize = 10,
  emptyMessage = "No hay datos para mostrar",
  loading = false,

  serverSide = false,

  total: totalProp,
  page: pageProp,
  pageSize: pageSizeProp,
  searchValue: searchValueProp,
  sort: sortProp,

  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onSortChange,
}: DataTableProps<T>) {
  const [searchState, setSearchState] = useState("")
  const [pageState, setPageState] = useState(1)
  const [pageSizeState, setPageSizeState] = useState(defaultPageSize)
  const [sortKeyState, setSortKeyState] = useState<keyof T | null>(null)
  const [sortDirState, setSortDirState] = useState<SortDirection>("asc")

  const search = serverSide ? (searchValueProp ?? "") : searchState
  const page = serverSide ? (pageProp ?? 1) : pageState
  const pageSize = serverSide ? (pageSizeProp ?? defaultPageSize) : pageSizeState
  const sortKey = serverSide ? (sortProp?.key ?? null) : sortKeyState
  const sortDir = serverSide ? (sortProp?.dir ?? "asc") : sortDirState

  useEffect(() => {
    if (!serverSide) setPageState(1)
  }, [searchState, pageSizeState, data, serverSide])

  const filteredData = useMemo(() => {
    if (serverSide) return data
    if (!search || !searchableKeys || searchableKeys.length === 0) return data
    const term = search.toLowerCase()
    return data.filter(row =>
      searchableKeys.some(key => {
        const value = row[key]
        if (value == null) return false
        return String(value).toLowerCase().includes(term)
      })
    )
  }, [data, search, searchableKeys, serverSide])

  const sortedData = useMemo(() => {
    if (serverSide) return filteredData
    if (!sortKey) return filteredData
    return [...filteredData].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (va == null && vb == null) return 0
      if (va == null) return sortDir === "asc" ? -1 : 1
      if (vb == null) return sortDir === "asc" ? 1 : -1
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va
      }
      const sa = String(va).toLowerCase()
      const sb = String(vb).toLowerCase()
      if (sa < sb) return sortDir === "asc" ? -1 : 1
      if (sa > sb) return sortDir === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortKey, sortDir, serverSide])

  const total = serverSide ? (totalProp ?? 0) : sortedData.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pageData = useMemo(() => {
    if (serverSide) return sortedData
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return sortedData.slice(start, end)
  }, [sortedData, currentPage, pageSize, serverSide])

  function setSearchValue(val: string) {
    if (serverSide) onSearchChange?.(val)
    else setSearchState(val)
  }

  function setPageValue(next: number) {
    if (serverSide) onPageChange?.(next)
    else setPageState(next)
  }

  function setPageSizeValue(next: number) {
    if (serverSide) onPageSizeChange?.(next)
    else setPageSizeState(next)
  }

  function toggleSort(key: keyof T) {
    if (serverSide) {
      if (sortKey !== key) onSortChange?.({ key, dir: "asc" })
      else onSortChange?.({ key, dir: sortDir === "asc" ? "desc" : "asc" })
      return
    }

    if (sortKeyState !== key) {
      setSortKeyState(key)
      setSortDirState("asc")
    } else {
      setSortDirState(prev => (prev === "asc" ? "desc" : "asc"))
    }
  }

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const to = total === 0 ? 0 : from + pageData.length - 1

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Input
          className="max-w-xs"
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => setSearchValue(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => {
                const content = col.headerNode ?? col.header
                return (
                  <TableHead key={String(col.key)} className={col.headerClassName}>
                    {col.sortable && !col.headerNode ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-left hover:underline cursor-pointer"
                        onClick={() => toggleSort(col.key as keyof T)}
                      >
                        <span>{col.header}</span>
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          )
                        ) : null}
                      </button>
                    ) : (
                      content
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
                <TableRow key={idx}>
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
            Mostrando {from}–{to} de {total}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filas por página</span>
            <Select value={String(pageSize)} onValueChange={val => setPageSizeValue(Number(val))}>
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
            onClick={() => setPageValue(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
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
            onClick={() => setPageValue(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}

