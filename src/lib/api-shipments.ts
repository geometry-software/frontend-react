import { authHeader } from "./api-auth"
import type { ShippingItem, ShippingStatus } from "../types/shipping"

const BASE =
  import.meta.env.VITE_SHIPMENTS_API_URL?.replace(/\/+$/, "") ||
  "https://nestjs-products.fly.dev/api"



async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(init?.headers || {}),
    },
  })

  let data: any = null
  try {
    data = await res.json()
  } catch {}

  if (!res.ok) {
    const msg = data?.message || data?.error || "Error de red"
    throw new Error(Array.isArray(msg) ? msg[0] : String(msg))
  }

  return data as T
}


function normalizePaginated(raw: any): { items: ShippingItem[]; total: number } {
  if (Array.isArray(raw)) return { items: raw as ShippingItem[], total: raw.length }

  if (raw && typeof raw === "object") {
    const items: ShippingItem[] =
      (Array.isArray(raw.items) && raw.items) ||
      (Array.isArray(raw.data) && raw.data) ||
      (Array.isArray(raw.results) && raw.results) ||
      []

    const total: number =
      (typeof raw.total === "number" && raw.total) ||
      (typeof raw.count === "number" && raw.count) ||
      (raw.meta && typeof raw.meta.total === "number" && raw.meta.total) ||
      items.length

    return { items, total }
  }

  return { items: [], total: 0 }
}

function buildQS(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "" || v === "all") return
    sp.set(k, String(v))
  })
  const qs = sp.toString()
  return qs ? `?${qs}` : ""
}



export async function listShipments(params: {
  page?: number
  limit?: number
  sortBy?: string
  sortDir?: "asc" | "desc"
  text?: string
  status?: string
  createdAtFrom?: string
  createdAtTo?: string
} = {}) {
  const qs = buildQS({
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy === "id" ? "_id" : params.sortBy,
    sortOrder: params.sortDir,
    query: params.text,
    status: params.status,
    createdAtFrom: params.createdAtFrom,
    createdAtTo: params.createdAtTo,
  })
  const raw = await jsonFetch<any>(`/shipments${qs}`, { method: "GET" })
  return normalizePaginated(raw)
}

export async function createShipment(dto: {
  customer: string
  date: string
  destination: string
}) {
  return jsonFetch<ShippingItem>("/shipments", {
    method: "POST",
    body: JSON.stringify(dto),
  })
}

export async function updateShipment(
  id: string,
  dto: Partial<{ customer: string; date: string; destination: string }>
) {
  return jsonFetch<ShippingItem>(`/shipments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  })
}

export async function updateShipmentStatus(id: string, status: ShippingStatus, note?: string) {
  return jsonFetch<ShippingItem>(`/shipments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  })
}

export async function deleteShipment(id: string) {
  return jsonFetch<{ ok: true }>(`/shipments/${id}`, { method: "DELETE" })
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
