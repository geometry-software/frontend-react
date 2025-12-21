import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

type SortDir = "asc" | "desc"

export type RemoteTableParams<T> = {
  page: number
  limit: number
  search: string
  sortBy?: keyof T
  sortDir?: SortDir
}

export type RemoteTableResult<T> = {
  items: T[]
  total: number
}

export type RemoteColumnDef<T> = {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
  headerClassName?: string
  cellClassName?: string
  headerNode?: React.ReactNode
}

type Props<T> = {
  columns: RemoteColumnDef<T>[]
  queryFn: (params: RemoteTableParams<T>) => Promise<RemoteTableResult<T>>
  searchPlaceholder?: string
  emptyMessage?: string
  pageSizeOptions?: number[]
  defaultPageSize?: number
  defaultSortBy?: keyof T
  defaultSortDir?: SortDir
}

export function RemoteDataTable<T extends Record<string, any>>({
  columns,
  queryFn,
  searchPlaceholder = "Buscar...",
  emptyMessage = "No hay datos",
  pageSizeOptions = [5, 10, 20],
  defaultPageSize = 10,
  defaultSortBy,
  defaultSortDir = "asc",
}: Props<T>) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(defaultPageSize)
  const [sortBy, setSortBy] = useState<keyof T | undefined>(defaultSortBy)
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir)

  const [items, setItems] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const currentPage = Math.min(page, totalPages)

  const sortableKeys = useMemo(
    () => new Set(columns.filter(c => c.sortable).map(c => c.key)),
    [columns]
  )

  useEffect(() => {
    setPage(1)
  }, [search, limit])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    queryFn({ page: currentPage, limit, search, sortBy, sortDir })
      .then(res => {
        if (!alive) return
        setItems(res.items)
        setTotal(res.total)
      })
      .catch((e: any) => {
        if (!alive) return
        setError(e?.message ?? "Error al cargar")
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [queryFn, currentPage, limit, search, sortBy, sortDir])

  function toggleSort(key: keyof T) {
    if (sortBy !== key) {
      setSortBy(key)
      setSortDir("asc")
    } else {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"))
    }
  }

  const from = total === 0 ? 0 : (currentPage - 1) * limit + 1
  const to = total === 0 ? 0 : from + items.length - 1

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Input
          className="max-w-xs"
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => {
                const content = col.headerNode ?? col.header
                const canSort = sortableKeys.has(col.key) && !col.headerNode
                return (
                  <TableHead key={String(col.key)} className={col.headerClassName}>
                    {canSort ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-left hover:underline cursor-pointer"
                        onClick={() => toggleSort(col.key as keyof T)}
                      >
                        <span>{col.header}</span>
                        {sortBy === col.key ? (
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
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <span className="text-sm text-muted-foreground">{emptyMessage}</span>
                </TableCell>
              </TableRow>
            ) : (
              items.map((row, idx) => (
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
            <Select value={String(limit)} onValueChange={v => setLimit(Number(v))}>
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
            onClick={() => setPage(p => Math.max(1, p - 1))}
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
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
