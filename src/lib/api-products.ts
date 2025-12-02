import { authHeader } from "./api-auth"

const PRODUCTS_BASE = import.meta.env.VITE_PRODUCTS_API_URL?.replace(/\/+$/, "") || ""

export type ProductDto = {
  _id: string
  name: string
  description?: string
  price: number
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PRODUCTS_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...authHeader(),
      ...(init?.headers || {}),
    },
  })

  const ctype = res.headers.get("content-type") || ""
  let data: any = null

  try {
    if (ctype.includes("application/json")) {
      data = await res.json()
    } else {
      const text = await res.text()
      data = text || null
    }
  } catch {
    data = null
  }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || "Error de red"
    throw new Error(Array.isArray(msg) ? msg[0] : String(msg))
  }

  return data as T
}

export async function fetchProducts(): Promise<ProductDto[]> {
  const data = await jsonFetch<ProductDto[]>("/products", { method: "GET" })
  return Array.isArray(data) ? data : []
}

export async function createProduct(input: { name: string; price: number; description?: string }): Promise<ProductDto> {
  return jsonFetch<ProductDto>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

