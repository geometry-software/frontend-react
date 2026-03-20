import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtDate(iso?: string) {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString()
}

export function toDateOnly(iso?: string) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

export function isoStartOfDay(dateOnly: string) {
  if (!dateOnly) return ""
  const d = new Date(`${dateOnly}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString()
}

export function isoEndOfDay(dateOnly: string) {
  if (!dateOnly) return ""
  const d = new Date(`${dateOnly}T23:59:59.999Z`)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString()
}

export function ymd(d = new Date()) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}
