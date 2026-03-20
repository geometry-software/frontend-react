import { useEffect, useMemo, useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import type { FilterProps, ShippingFilters } from "../../types/filters"
import { statusLabel } from "../../lib/mock-shipping"
import type { ShippingStatus } from "../../types/shipping"

export default function ShippingFiltersSheet({
  value,
  onApply,
  onClear,
}: FilterProps<ShippingFilters>) {
  const [open, setOpen] = useState(false)

  const [text, setText] = useState(value.text ?? "")
  const [status, setStatus] = useState(value.status ?? "all")
  const [dateFrom, setDateFrom] = useState(value.dateFrom ?? "")
  const [dateTo, setDateTo] = useState(value.dateTo ?? "")

  useEffect(() => {
    setText(value.text ?? "")
    setStatus(value.status ?? "all")
    setDateFrom(value.dateFrom ?? "")
    setDateTo(value.dateTo ?? "")
  }, [value])

  const showClear = useMemo(() => {
    return (
      !!text.trim() ||
      status !== "all" ||
      !!dateFrom ||
      !!dateTo
    )
  }, [text, status, dateFrom, dateTo])

  function handleApply() {
    onApply({
      text: text.trim(),
      status,
      dateFrom,
      dateTo,
    })
    setOpen(false)
  }

  function handleClear() {
    onClear()
    setOpen(false)
  }

  const statuses: (ShippingStatus | "all")[] = ["all", "pending", "in_transit", "on_the_way", "delivered", "delayed", "cancelled"]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <SlidersHorizontal className="mr-2 size-4" />
          Filtros
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[360px] sm:w-[420px] p-0">
        <div className="h-full px-6 py-6">
          <SheetHeader className="text-left">
            <SheetTitle className="text-lg font-semibold">Opciones de Filtro</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ship-search">Búsqueda rápida</Label>
              <Input
                id="ship-search"
                value={text}
                placeholder="ID, cliente, destino..."
                onChange={e => setText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(s => (
                    <SelectItem key={s} value={s}>
                      {s === "all" ? "Todos" : statusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 rounded-lg border p-4">
              <Label>Rango de Fecha de Entrega</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Desde</span>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Hasta</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6 flex flex-row items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="px-6 cursor-pointer"
              onClick={handleClear}
              disabled={!showClear}
            >
              Limpiar
            </Button>

            <Button type="button" className="px-6 cursor-pointer" onClick={handleApply}>
              Aplicar Filtros
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
