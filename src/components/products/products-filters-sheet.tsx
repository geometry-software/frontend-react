import { useEffect, useMemo, useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet"
import type { FilterProps, ProductsFilters } from "../../types/filters"
import { isoEndOfDay, isoStartOfDay, toDateOnly } from "../../lib/utils"

export default function ProductsFiltersSheet({
  value,
  onApply,
  onClear,
}: FilterProps<ProductsFilters>) {
  const [open, setOpen] = useState(false)

  const [text, setText] = useState(value.text ?? "")
  const [inName, setInName] = useState(!!value.inName)
  const [inDescription, setInDescription] = useState(!!value.inDescription)
  const [inPrice, setInPrice] = useState(!!value.inPrice)
  const [createdFrom, setCreatedFrom] = useState("")
  const [createdTo, setCreatedTo] = useState("")

  useEffect(() => {
    setText(value.text ?? "")
    setInName(!!value.inName)
    setInDescription(!!value.inDescription)
    setInPrice(!!value.inPrice)
    setCreatedFrom(toDateOnly(value.createdAtFrom))
    setCreatedTo(toDateOnly(value.createdAtTo))
  }, [value])

  const showClear = useMemo(() => {
    return (
      !!text.trim() ||
      inName ||
      inDescription ||
      inPrice ||
      !!createdFrom ||
      !!createdTo
    )
  }, [text, inName, inDescription, inPrice, createdFrom, createdTo])

  function handleApply() {
    onApply({
      ...value,
      text: text.trim(),
      inName,
      inDescription,
      inPrice,
      createdAtFrom: isoStartOfDay(createdFrom),
      createdAtTo: isoEndOfDay(createdTo),
    })
    setOpen(false)
  }

  function handleClear() {
    onClear()
    setOpen(false)
  }

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
              <Label htmlFor="prod-search">Búsqueda</Label>
              <Input
                id="prod-search"
                value={text}
                placeholder="Palabras clave..."
                onChange={e => setText(e.target.value)}
              />
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <Label className="text-xs text-muted-foreground uppercase font-bold">Buscar en:</Label>
              <div className="flex items-center gap-2">
                <Checkbox id="check-name" checked={inName} onCheckedChange={v => setInName(Boolean(v))} />
                <Label htmlFor="check-name" className="text-sm font-normal cursor-pointer">Nombre</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="check-desc"
                  checked={inDescription}
                  onCheckedChange={v => setInDescription(Boolean(v))}
                />
                <Label htmlFor="check-desc" className="text-sm font-normal cursor-pointer">Descripción</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="check-price" checked={inPrice} onCheckedChange={v => setInPrice(Boolean(v))} />
                <Label htmlFor="check-price" className="text-sm font-normal cursor-pointer">Precio</Label>
              </div>

              <p className="text-[11px] text-muted-foreground mt-2 italic">
                * Si no marcas nada, la búsqueda será general.
              </p>
            </div>

            <div className="space-y-2 rounded-lg border p-4">
              <Label>Fecha de Creación</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Desde</span>
                  <Input
                    type="date"
                    value={createdFrom}
                    onChange={e => setCreatedFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Hasta</span>
                  <Input
                    type="date"
                    value={createdTo}
                    onChange={e => setCreatedTo(e.target.value)}
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
              Aplicar
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}


