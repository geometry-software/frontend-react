import type { ShippingItem, ShippingStatus } from "../types/shipping"
import { ymd } from "./utils"

const KEY = "mock:shipping:items"

function iso(d = new Date()) {
  return d.toISOString()
}

function seed(): ShippingItem[] {
  const now = new Date()
  const daysAgo = (n: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() - n)
    return d
  }

  return [
    {
      id: "1023",
      customer: "Carlos Mendez",
      date: ymd(daysAgo(0)),
      destination: "Bogotá",
      status: "in_transit",
      createdAt: iso(daysAgo(3)),
      updatedAt: iso(daysAgo(0)),
      history: [
        { at: iso(daysAgo(3)), status: "pending" },
        { at: iso(daysAgo(2)), status: "in_transit" },
      ],
    },
    {
      id: "1024",
      customer: "Laura Gómez",
      date: ymd(daysAgo(1)),
      destination: "Medellín",
      status: "pending",
      createdAt: iso(daysAgo(2)),
      updatedAt: iso(daysAgo(1)),
      history: [{ at: iso(daysAgo(2)), status: "pending" }],
    },
    {
      id: "1021",
      customer: "Empresa XYZ",
      date: ymd(daysAgo(2)),
      destination: "Caracas",
      status: "delivered",
      createdAt: iso(daysAgo(5)),
      updatedAt: iso(daysAgo(2)),
      history: [
        { at: iso(daysAgo(5)), status: "pending" },
        { at: iso(daysAgo(4)), status: "in_transit" },
        { at: iso(daysAgo(2)), status: "delivered" },
      ],
    },
    {
      id: "1018",
      customer: "Juan Pérez",
      date: ymd(daysAgo(3)),
      destination: "Brasil",
      status: "on_the_way",
      createdAt: iso(daysAgo(4)),
      updatedAt: iso(daysAgo(3)),
      history: [
        { at: iso(daysAgo(4)), status: "pending" },
        { at: iso(daysAgo(3)), status: "on_the_way" },
      ],
    },
    {
      id: "1017",
      customer: "Ana Torres",
      date: ymd(daysAgo(4)),
      destination: "Barquisimeto",
      status: "cancelled",
      createdAt: iso(daysAgo(4)),
      updatedAt: iso(daysAgo(4)),
      history: [{ at: iso(daysAgo(4)), status: "cancelled" }],
    },
  ]
}

function load(): ShippingItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const s = seed()
      localStorage.setItem(KEY, JSON.stringify(s))
      return s
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ShippingItem[]) : []
  } catch {
    const s = seed()
    localStorage.setItem(KEY, JSON.stringify(s))
    return s
  }
}

function save(items: ShippingItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

export async function listShipments(params: {
  page?: number
  limit?: number
  sortBy?: string
  sortDir?: "asc" | "desc"
  text?: string
  status?: string
  dateFrom?: string
  dateTo?: string
} = {}) {
  await sleep(250)
  let items = load()

  // Filter by text (id, customer, destination)
  if (params.text) {
    const q = params.text.toLowerCase()
    items = items.filter(
      x =>
        x.id.toLowerCase().includes(q) ||
        x.customer.toLowerCase().includes(q) ||
        x.destination.toLowerCase().includes(q)
    )
  }

  // Filter by status
  if (params.status && params.status !== "all" && params.status !== "") {
    items = items.filter(x => x.status === params.status)
  }

  // Filter by date range (item.date is YYYY-MM-DD)
  if (params.dateFrom) {
    items = items.filter(x => x.date >= params.dateFrom!)
  }
  if (params.dateTo) {
    items = items.filter(x => x.date <= params.dateTo!)
  }

  // Sort
  const { sortBy = "createdAt", sortDir = "desc" } = params
  items.sort((a, b) => {
    const valA = (a as any)[sortBy] ?? ""
    const valB = (b as any)[sortBy] ?? ""
    if (valA < valB) return sortDir === "asc" ? -1 : 1
    if (valA > valB) return sortDir === "asc" ? 1 : -1
    return 0
  })

  // Paginate
  const total = items.length
  const page = params.page || 1
  const limit = params.limit || 10
  const start = (page - 1) * limit
  const end = start + limit
  const paged = items.slice(start, end)

  return { items: paged, total }
}

export async function createShipment(dto: { customer: string; date: string; destination: string }) {
  await sleep(250)
  const items = load()
  const now = iso()

  const item: ShippingItem = {
    id: String(Math.floor(1000 + Math.random() * 9000)),
    customer: dto.customer.trim(),
    date: dto.date,
    destination: dto.destination.trim(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
    history: [{ at: now, status: "pending" }],
  }

  items.unshift(item)
  save(items)
  return item
}

export async function updateShipment(
  id: string,
  dto: Partial<{ customer: string; date: string; destination: string }>
) {
  await sleep(250)
  const items = load()
  const idx = items.findIndex(x => x.id === id)
  if (idx < 0) throw new Error("Envío no encontrado")

  const now = iso()
  const next: ShippingItem = {
    ...items[idx],
    customer: dto.customer ?? items[idx].customer,
    date: dto.date ?? items[idx].date,
    destination: dto.destination ?? items[idx].destination,
    updatedAt: now,
  }

  items[idx] = next
  save(items)
  return next
}

export async function deleteShipment(id: string) {
  await sleep(250)
  const items = load().filter(x => x.id !== id)
  save(items)
  return { ok: true }
}

export async function updateShipmentStatus(id: string, status: ShippingStatus, note?: string) {
  await sleep(250)
  const items = load()
  const idx = items.findIndex(x => x.id === id)
  if (idx < 0) throw new Error("Envío no encontrado")

  const now = iso()
  const current = items[idx]
  const next: ShippingItem = {
    ...current,
    status,
    updatedAt: now,
    history: [{ at: now, status, note }, ...(current.history || [])],
  }

  items[idx] = next
  save(items)
  return next
}

export function statusLabel(s: ShippingStatus) {
  if (s === "pending") return "Pendiente"
  if (s === "in_transit") return "En tránsito"
  if (s === "on_the_way") return "En camino"
  if (s === "delivered") return "Entregado"
  if (s === "cancelled") return "Cancelado"
  return "Retrasado"
}

export function statusVariant(
  s: ShippingStatus
): "default" | "secondary" | "destructive" | "outline" {
  if (s === "delivered") return "default"
  if (s === "pending") return "secondary"
  if (s === "cancelled") return "destructive"
  if (s === "delayed") return "destructive"
  return "outline"
}