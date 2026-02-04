import React, { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
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
  render?: (row: T) => ReactNode
  headerClassName?: string
  cellClassName?: string
  headerNode?: ReactNode
}

type ClientTableProps<T> = {
  serverSide?: false
  data?: T[]
  columns?: ColumnDef<T>[]
  searchableKeys?: (keyof T)[]
  searchPlaceholder?: string
  pageSizeOptions?: number[]
  defaultPageSize?: number
  emptyMessage?: string
  loading?: boolean
  toolbarRight?: ReactNode
}

type ServerTableProps<T> = {
  serverSide: true
  data?: T[]
  columns?: ColumnDef<T>[]
  total?: number
  page?: number
  pageSize?: number
  pageSizeOptions?: number[]
  sort?: { key: string; dir: SortDirection }
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onSortChange?: (sort: { key: string; dir: SortDirection }) => void
  emptyMessage?: string
  loading?: boolean
  toolbarRight?: ReactNode
}

type DataTableProps<T> = ClientTableProps<T> | ServerTableProps<T>

export function DataTable<T extends Record<string, any>>(props: DataTableProps<T>) {
  const isServer = (props as ServerTableProps<T>).serverSide === true

  const safeData = (props.data ?? []) as T[]
  const safeColumns = (props.columns ?? []) as ColumnDef<T>[]

  const emptyMessage = props.emptyMessage ?? "No hay datos para mostrar"
  const loading = props.loading ?? false
  const toolbarRight = props.toolbarRight

  const pageSizeOptions = props.pageSizeOptions ?? [5, 10, 20]

  const [search, setSearch] = useState("")
  const [clientPage, setClientPage] = useState(1)
  const [clientPageSize, setClientPageSize] = useState(
    !isServer ? (props as ClientTableProps<T>).defaultPageSize ?? 10 : 10
  )
  const [clientSortKey, setClientSortKey] = useState<keyof T | null>(null)
  const [clientSortDir, setClientSortDir] = useState<SortDirection>("asc")

  useEffect(() => {
    if (!isServer) setClientPage(1)
  }, [isServer, search, clientPageSize, safeData])

  const filteredData = useMemo(() => {
    if (isServer) return safeData
    const p = props as ClientTableProps<T>
    const keys = p.searchableKeys ?? []
    if (!search || keys.length === 0) return safeData
    const term = search.toLowerCase()
    return safeData.filter(row =>
      keys.some(key => {
        const value = row[key]
        if (value == null) return false
        return String(value).toLowerCase().includes(term)
      })
    )
  }, [isServer, props, safeData, search])

  const sortedData = useMemo(() => {
    if (isServer) return filteredData
    if (!clientSortKey) return filteredData

    return [...filteredData].sort((a, b) => {
      const va = a[clientSortKey]
      const vb = b[clientSortKey]
      if (va == null && vb == null) return 0
      if (va == null) return clientSortDir === "asc" ? -1 : 1
      if (vb == null) return clientSortDir === "asc" ? 1 : -1
      if (typeof va === "number" && typeof vb === "number") {
        return clientSortDir === "asc" ? va - vb : vb - va
      }
      const sa = String(va).toLowerCase()
      const sb = String(vb).toLowerCase()
      if (sa < sb) return clientSortDir === "asc" ? -1 : 1
      if (sa > sb) return clientSortDir === "asc" ? 1 : -1
      return 0
    })
  }, [isServer, filteredData, clientSortKey, clientSortDir])

  const serverTotal = isServer ? (props as ServerTableProps<T>).total ?? 0 : sortedData.length
  const serverPage = isServer ? (props as ServerTableProps<T>).page ?? 1 : clientPage
  const serverPageSize = isServer ? (props as ServerTableProps<T>).pageSize ?? 10 : clientPageSize

  const totalPages = Math.max(1, Math.ceil(serverTotal / serverPageSize))
  const currentPage = Math.min(serverPage, totalPages)

  const pageData = useMemo(() => {
    if (isServer) return safeData
    const start = (currentPage - 1) * serverPageSize
    const end = start + serverPageSize
    return sortedData.slice(start, end)
  }, [isServer, safeData, sortedData, currentPage, serverPageSize])

  function toggleSortClient(key: keyof T) {
    if (clientSortKey !== key) {
      setClientSortKey(key)
      setClientSortDir("asc")
    } else {
      setClientSortDir(prev => (prev === "asc" ? "desc" : "asc"))
    }
  }

  function toggleSortServer(key: string) {
    const p = props as ServerTableProps<T>
    if (!p.onSortChange) return
    const current = p.sort
    if (!current || current.key !== key) {
      p.onSortChange({ key, dir: "asc" })
    } else {
      p.onSortChange({ key, dir: current.dir === "asc" ? "desc" : "asc" })
    }
  }

  function sortIndicator(colKey: string) {
    if (!isServer) {
      if (clientSortKey !== (colKey as any)) return null
      return clientSortDir === "asc" ? (
        <ChevronUp className="size-3" />
      ) : (
        <ChevronDown className="size-3" />
      )
    }
    const p = props as ServerTableProps<T>
    if (!p.sort || p.sort.key !== colKey) return null
    return p.sort.dir === "asc" ? (
      <ChevronUp className="size-3" />
    ) : (
      <ChevronDown className="size-3" />
    )
  }

  const from = serverTotal === 0 ? 0 : (currentPage - 1) * serverPageSize + 1
  const to = serverTotal === 0 ? 0 : from + pageData.length - 1

  const showClientSearch =
    !isServer && (((props as ClientTableProps<T>).searchableKeys ?? []).length > 0)
  const searchPlaceholder =
    !isServer ? (props as ClientTableProps<T>).searchPlaceholder ?? "Buscar..." : "Buscar..."
  return (
    <div className="flex flex-col gap-4">
      {(showClientSearch || toolbarRight) && (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {showClientSearch ? (
            <Input
              className="max-w-xs"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          ) : (
            <div />
          )}
          {toolbarRight ? <div className="flex justify-end">{toolbarRight}</div> : null}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {safeColumns.map(col => {
                const content = col.headerNode ?? col.header
                const sortable = !!col.sortable && !col.headerNode

                return (
                  <TableHead key={String(col.key)} className={col.headerClassName}>
                    {sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-left hover:underline cursor-pointer"
                        onClick={() =>
                          isServer
                            ? toggleSortServer(String(col.key))
                            : toggleSortClient(col.key as keyof T)
                        }
                      >
                        <span>{col.header}</span>
                        {sortIndicator(String(col.key))}
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
                <TableCell colSpan={safeColumns.length || 1} className="h-24 text-center">
                  <span className="text-sm text-muted-foreground">Cargando…</span>
                </TableCell>
              </TableRow>
            ) : pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={safeColumns.length || 1} className="h-24 text-center">
                  <span className="text-sm text-muted-foreground">{emptyMessage}</span>
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((row, idx) => (
                <TableRow key={idx}>
                  {safeColumns.map(col => (
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
            Mostrando {from}–{to} de {serverTotal}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filas por página</span>
            <Select
              value={String(serverPageSize)}
              onValueChange={val => {
                const n = Number(val)
                if (isServer) {
                  ;(props as ServerTableProps<T>).onPageSizeChange?.(n)
                } else {
                  setClientPageSize(n)
                }
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
            onClick={() => {
              if (isServer) {
                ;(props as ServerTableProps<T>).onPageChange?.(Math.max(1, currentPage - 1))
              } else {
                setClientPage(p => Math.max(1, p - 1))
              }
            }}
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
            onClick={() => {
              if (isServer) {
                ;(props as ServerTableProps<T>).onPageChange?.(Math.min(totalPages, currentPage + 1))
              } else {
                setClientPage(p => Math.min(totalPages, p + 1))
              }
            }}
            disabled={currentPage >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
