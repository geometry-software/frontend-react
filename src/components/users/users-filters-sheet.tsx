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
import type { UsersFilters } from "../../types/users"
import { isoEndOfDay, isoStartOfDay, toDateOnly } from "../../lib/utils"

type UsersFiltersSheetProps = {
  value: UsersFilters
  onApply: (next: UsersFilters) => void
  onClear: () => void
}

export default function UsersFiltersSheet({
  value,
  onApply,
  onClear,
}: UsersFiltersSheetProps) {
  const [open, setOpen] = useState(false)

  const [text, setText] = useState(value.text ?? "")
  const [createdFrom, setCreatedFrom] = useState("")
  const [createdTo, setCreatedTo] = useState("")

  useEffect(() => {
    setText(value.text ?? "")
    setCreatedFrom(toDateOnly(value.createdAtFrom))
    setCreatedTo(toDateOnly(value.createdAtTo))
  }, [value])

  const showClear = useMemo(() => {
    return !!text.trim() || !!createdFrom || !!createdTo
  }, [text, createdFrom, createdTo])

  function handleApply() {
    onApply({
      text: text.trim(),
      role: '',
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
            <SheetTitle className="text-lg font-semibold">
              Filtros de Usuarios
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">

            <div className="space-y-2">
              <Label htmlFor="user-search">Búsqueda</Label>
              <Input
                id="user-search"
                value={text}
                placeholder="Nombre, email..."
                onChange={(e) => setText(e.target.value)}
              />
            </div>


            <div className="space-y-2 rounded-lg border p-4">
              <Label>Fecha de Creación</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                    Desde
                  </span>
                  <Input
                    type="date"
                    value={createdFrom}
                    onChange={(e) => setCreatedFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                    Hasta
                  </span>
                  <Input
                    type="date"
                    value={createdTo}
                    onChange={(e) => setCreatedTo(e.target.value)}
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

            <Button
              type="button"
              className="px-6 cursor-pointer"
              onClick={handleApply}
            >
              Aplicar
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
