import { authHeader } from "./api-auth"

const BASE =
  import.meta.env.VITE_PRODUCTS_URL?.replace(/\/+$/, "") ||
  "https://nestjs-products.fly.dev"

export type ProductDto = {
  _id: string
  name: string
  description?: string
  price: number
  createdAt?: string
  updatedAt?: string
}

export type ProductsQuery = {
  query?: string
  name?: string
  description?: string
  createdAtFrom?: string
  createdAtTo?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

function buildQueryString(q: ProductsQuery) {
  const sp = new URLSearchParams()
  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return
    sp.set(k, String(v))
  })
  const qs = sp.toString()
  return qs ? `?${qs}` : ""
}

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

function normalizeListResponse(raw: any): { items: ProductDto[]; total: number } {
  if (Array.isArray(raw)) return { items: raw as ProductDto[], total: raw.length }

  if (raw && typeof raw === "object") {
    const items =
      (Array.isArray(raw.items) && raw.items) ||
      (Array.isArray(raw.data) && raw.data) ||
      (Array.isArray(raw.results) && raw.results) ||
      (Array.isArray(raw.payload) && raw.payload) ||
      []

    const metaTotal =
      (raw.meta && typeof raw.meta.total === "number" && raw.meta.total) ||
      (raw.meta && typeof raw.meta.count === "number" && raw.meta.count) ||
      null

    const total =
      (typeof raw.total === "number" && raw.total) ||
      (typeof raw.count === "number" && raw.count) ||
      (typeof raw.totalCount === "number" && raw.totalCount) ||
      (metaTotal ?? items.length)

    return { items, total }
  }

  return { items: [], total: 0 }
}


export async function fetchProducts(query: ProductsQuery) {
  const qs = buildQueryString(query)
  const raw = await jsonFetch<any>(`/api/products${qs}`, { method: "GET" })
  return normalizeListResponse(raw)
}

export async function createProduct(dto: {
  name: string
  description?: string
  price: number
}) {
  return jsonFetch<ProductDto>("/api/products", {
    method: "POST",
    body: JSON.stringify(dto),
  })
}

export async function updateProduct(
  id: string,
  dto: Partial<{ name: string; description?: string; price: number }>
) {
  return jsonFetch<ProductDto>(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  })
}

export async function deleteProduct(id: string) {
  return jsonFetch<{ ok?: boolean }>(`/api/products/${id}`, { method: "DELETE" })
}

