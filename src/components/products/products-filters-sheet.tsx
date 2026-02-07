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

export type ProductsFilterMode = {
  text: string
  inName: boolean
  inDescription: boolean
  inPrice: boolean
  createdAtFrom: string
  createdAtTo: string
}

type Props = {
  value: ProductsFilterMode
  onApply: (next: ProductsFilterMode) => void
  onClear: () => void
}

function isoStartOfDay(dateOnly: string) {
  if (!dateOnly) return ""
  const d = new Date(`${dateOnly}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString()
}

function isoEndOfDay(dateOnly: string) {
  if (!dateOnly) return ""
  const d = new Date(`${dateOnly}T23:59:59.999Z`)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString()
}

function toDateOnly(iso: string) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

export default function ProductsFiltersSheet({ value, onApply, onClear }: Props) {
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

  const canApply = useMemo(() => {
    const hasText = !!text.trim()
    const hasDates = !!createdFrom || !!createdTo
    return hasText || hasDates
  }, [text, createdFrom, createdTo])

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
    setText("")
    setInName(false)
    setInDescription(false)
    setInPrice(false)
    setCreatedFrom("")
    setCreatedTo("")
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
              Filter Options
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-8">
            <div className="space-y-2">
              <Label htmlFor="prod-search">Search</Label>
              <Input
                id="prod-search"
                value={text}
                placeholder="Enter keywords..."
                onChange={e => setText(e.target.value)}
              />
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Checkbox checked={inName} onCheckedChange={v => setInName(Boolean(v))} />
                <span className="text-sm">Name</span>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={inDescription}
                  onCheckedChange={v => setInDescription(Boolean(v))}
                />
                <span className="text-sm">Description</span>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox checked={inPrice} onCheckedChange={v => setInPrice(Boolean(v))} />
                <span className="text-sm">Price</span>
              </div>

              <p className="text-xs text-muted-foreground">
                Si no marcas nada, la búsqueda es general.
              </p>
            </div>

            <div className="space-y-2 rounded-lg border p-4">
              <Label>Created At</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={createdFrom}
                  onChange={e => setCreatedFrom(e.target.value)}
                />
                <Input
                  type="date"
                  value={createdTo}
                  onChange={e => setCreatedTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-10">
            <div className="flex w-full justify-center gap-3">
              <Button
                variant="outline"
                className="w-32 cursor-pointer"
                onClick={handleClear}
                disabled={!showClear}
              >
                Clear
              </Button>
              <Button
                className="w-32 cursor-pointer"
                disabled={!canApply}
                onClick={handleApply}
              >
                Search
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}


