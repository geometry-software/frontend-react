import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "../components/dashboard-layout"
import { Button } from "../components/ui/button"
import { DataTable, type ColumnDef } from "../components/data-table"
import { Badge } from "../components/ui/badge"
import { Card, CardContent } from "../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import {
  fetchShipments,
  addShipment,
  editShipment,
  removeShipment,
  setShipmentStatusAction,
  setPage,
  setLimit,
  setSort,
  setFilters,
  clearFilters,
} from "../features/shipping/shippingSlice"
import type { ShippingItem, ShippingStatus } from "../types/shipping"
import { statusLabel, statusVariant } from "../lib/mock-shipping"
import { BarChart3, Clock, PackageCheck, Truck } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts"
import { ymd } from "../lib/utils"
import ShippingFiltersSheet from "../components/shipping/shipping-filters-sheet"

type FormMode = "create" | "edit"

export default function ShippingPage() {
  const dispatch = useAppDispatch()
  const { items, total, page, limit, sortBy, sortDir, filters, loading, error } =
    useAppSelector(s => s.shipping)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>("create")
  const [current, setCurrent] = useState<ShippingItem | null>(null)
  const [customer, setCustomer] = useState("")
  const [date, setDate] = useState(ymd(new Date()))
  const [destination, setDestination] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const [trackOpen, setTrackOpen] = useState(false)
  const [trackItem, setTrackItem] = useState<ShippingItem | null>(null)
  const [trackStatus, setTrackStatus] = useState<ShippingStatus>("pending")
  const [trackNote, setTrackNote] = useState("")

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ShippingItem | null>(null)

  useEffect(() => {
    dispatch(fetchShipments())
  }, [dispatch, page, limit, sortBy, sortDir, filters])

  const kpis = useMemo(() => {
    const today = ymd(new Date())
    const activos = items.filter(x => x.status !== "delivered" && x.status !== "cancelled").length
    const pendientes = items.filter(x => x.status === "pending").length
    const entregasHoy = items.filter(x => x.status === "delivered" && (x.updatedAt || "").slice(0, 10) === today).length
    const retrasados = items.filter(x => x.status === "delayed").length
    return { activos, pendientes, entregasHoy, retrasados }
  }, [items])

  const chartData = useMemo(() => {
    const map = new Map<string, { day: string; total: number; delivered: number }>()
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    items.forEach(it => {
      const d = new Date(it.createdAt)
      const idx = (d.getDay() + 6) % 7
      const key = String(idx)
      const cur = map.get(key) || { day: days[idx], total: 0, delivered: 0 }
      cur.total += 1
      if (it.status === "delivered") cur.delivered += 1
      map.set(key, cur)
    })
    return Array.from(map.entries())
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, v]) => v)
  }, [items])

  function openCreate() {
    setFormMode("create")
    setCurrent(null)
    setCustomer("")
    setDate(ymd(new Date()))
    setDestination("")
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(it: ShippingItem) {
    setFormMode("edit")
    setCurrent(it)
    setCustomer(it.customer)
    setDate(it.date)
    setDestination(it.destination)
    setFormError(null)
    setFormOpen(true)
  }

  function openTrack(it: ShippingItem) {
    setTrackItem(it)
    setTrackStatus(it.status)
    setTrackNote("")
    setTrackOpen(true)
  }

  function openDelete(it: ShippingItem) {
    setDeleteTarget(it)
    setDeleteOpen(true)
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const c = customer.trim()
    const d = destination.trim()
    const dt = date.trim()

    if (!c) return setFormError("Cliente es obligatorio")
    if (!dt) return setFormError("Fecha es obligatoria")
    if (!d) return setFormError("Destino es obligatorio")

    if (formMode === "create") {
      await dispatch(addShipment({ customer: c, date: dt, destination: d }))
    } else if (formMode === "edit" && current) {
      await dispatch(editShipment({ id: current.id, dto: { customer: c, date: dt, destination: d } }))
    }

    setFormOpen(false)
    setCurrent(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await dispatch(removeShipment(deleteTarget.id))
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  async function saveTracking() {
    if (!trackItem) return
    await dispatch(setShipmentStatusAction({ id: trackItem.id, status: trackStatus, note: trackNote.trim() || undefined }))
    setTrackOpen(false)
    setTrackItem(null)
  }

  const columns: ColumnDef<ShippingItem>[] = useMemo(() => [
    { key: "id", header: "ID", sortable: true, render: r => `#${r.id}` },
    { key: "customer", header: "Cliente", sortable: true },
    { key: "date", header: "Fecha", sortable: true },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: r => (
        <Badge variant={statusVariant(r.status)}>
          {statusLabel(r.status)}
        </Badge>
      ),
    },
    { key: "destination", header: "Destino", sortable: true },
    {
      key: "actions",
      header: "Acciones",
      headerNode: (
        <div className="flex justify-end pr-4">
          <div className="min-w-[210px] flex justify-center">Acciones</div>
        </div>
      ),
      cellClassName: "text-right pr-4",
      render: r => (
        <div className="flex justify-end">
          <div className="min-w-[210px] flex justify-center gap-2">
            <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => openTrack(r)}>
              Seguimiento
            </Button>
            <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => openEdit(r)}>
              Editar
            </Button>
            <Button size="sm" variant="destructive" className="cursor-pointer" onClick={() => openDelete(r)}>
              Eliminar
            </Button>
          </div>
        </div>
      ),
    },
  ], [])

  return (
    <DashboardLayout pageTitle="Shipping">
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Truck className="size-5" />
            <div>
              <p className="text-xs text-muted-foreground">Envíos Activos</p>
              <p className="text-2xl font-semibold">{kpis.activos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="size-5" />
            <div>
              <p className="text-xs text-muted-foreground">Pedidos Pendientes</p>
              <p className="text-2xl font-semibold">{kpis.pendientes}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <PackageCheck className="size-5" />
            <div>
              <p className="text-xs text-muted-foreground">Entregas Hoy</p>
              <p className="text-2xl font-semibold">{kpis.entregasHoy}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart3 className="size-5" />
            <div>
              <p className="text-xs text-muted-foreground">Envíos Retrasados</p>
              <p className="text-2xl font-semibold">{kpis.retrasados}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="p-4">
          <p className="font-medium mb-3">Pedidos por Día</p>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[180px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="delivered" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pedidos Agendados</h2>
        <Button size="sm" className="cursor-pointer" onClick={openCreate}>
          + Nuevo Pedido
        </Button>
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <div className="mt-3">
        <DataTable<ShippingItem>
          serverSide
          data={items}
          total={total}
          page={page}
          pageSize={limit}
          sort={{ key: sortBy, dir: sortDir }}
          onPageChange={p => dispatch(setPage(p))}
          onPageSizeChange={n => dispatch(setLimit(n))}
          onSortChange={s => dispatch(setSort({ sortBy: s.key, sortDir: s.dir }))}
          columns={columns}
          emptyMessage="No hay pedidos"
          loading={loading}
          toolbarRight={
            <ShippingFiltersSheet
              value={filters}
              onApply={next => dispatch(setFilters(next))}
              onClear={() => dispatch(clearFilters())}
            />
          }
        />
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? "Nuevo pedido" : "Editar pedido"}</DialogTitle>
            <DialogDescription>Completa los campos y guarda.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={submitForm}>
            <div className="space-y-2">
              <Label htmlFor="ship-customer">Cliente</Label>
              <Input id="ship-customer" value={customer} onChange={e => setCustomer(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ship-date">Fecha de Entrega</Label>
              <Input id="ship-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ship-dest">Destino</Label>
              <Input id="ship-dest" value={destination} onChange={e => setDestination(e.target.value)} />
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer">
                {formMode === "create" ? "Crear" : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={trackOpen} onOpenChange={setTrackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seguimiento</DialogTitle>
            <DialogDescription>
              {trackItem ? `Pedido #${trackItem.id} — ${trackItem.customer}` : ""}
            </DialogDescription>
          </DialogHeader>

          {trackItem && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Destino</p>
                  <p className="text-sm">{trackItem.destination}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha Estimada</p>
                  <p className="text-sm">{trackItem.date}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["pending", "in_transit", "on_the_way", "delivered", "delayed", "cancelled"] as ShippingStatus[]).map(s => (
                    <Button
                      key={s}
                      type="button"
                      variant={trackStatus === s ? "default" : "outline"}
                      className="cursor-pointer justify-start h-9 text-xs"
                      onClick={() => setTrackStatus(s)}
                    >
                      {statusLabel(s)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="track-note">Nota de actualización (opcional)</Label>
                <Input id="track-note" value={trackNote} onChange={e => setTrackNote(e.target.value)} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Historial de Estados</p>
                <div className="max-h-[180px] overflow-auto rounded-md border p-3 space-y-2 bg-muted/20">
                  {(trackItem.history || []).length > 0 ? (
                    (trackItem.history || []).map((h, i) => (
                      <div key={i} className="text-[12px] flex flex-col border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-primary">{statusLabel(h.status)}</span>
                          <span className="text-muted-foreground">{new Date(h.at).toLocaleString()}</span>
                        </div>
                        {h.note && <span className="text-muted-foreground italic">"{h.note}"</span>}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No hay historial disponible</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setTrackOpen(false)}>
              Cerrar
            </Button>
            <Button type="button" className="cursor-pointer" onClick={saveTracking}>
              Guardar actualización
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este pedido?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer y borrará permanentemente el historial de este envío.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => {
                setDeleteOpen(false)
                setDeleteTarget(null)
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction className="cursor-pointer" onClick={confirmDelete}>
              Eliminar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}