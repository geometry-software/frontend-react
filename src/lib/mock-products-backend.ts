import type { ProductDto } from "./api-products"

type SortDir = "asc" | "desc"

export type ProductsQuery = {
  page: number
  limit: number
  search: string
  sortBy?: keyof ProductDto
  sortDir?: SortDir
}

export type ProductsQueryResult = {
  items: ProductDto[]
  total: number
}

const KEY = "mock:products"
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

function normalize(s: string) {
  return s.trim().toLowerCase()
}

function seed(): ProductDto[] {
  const items: ProductDto[] = [
    { _id: "p1", name: "Gorro navideño", description: "Gorro navideño", price: 12.5 },
    { _id: "p2", name: "Gorro para la nieve", description: "Gorro para la nieve", price: 10.0 },
    { _id: "p3", name: "Bicicleta", description: "Bicicleta", price: 9.75 },
    { _id: "p4", name: "Iphone", description: "Iphone", price: 15.0 },
    { _id: "p5", name: "Cargador de batería", description: "Cargador de batería", price: 11.2 },
  ]
  localStorage.setItem(KEY, JSON.stringify(items))
  return items
}

function load(): ProductDto[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seed()
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : seed()
  } catch {
    return seed()
  }
}

function save(items: ProductDto[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export async function mockListProducts(q: ProductsQuery): Promise<ProductsQueryResult> {
  await sleep(150)

  const page = Math.max(1, q.page || 1)
  const limit = Math.max(1, q.limit || 10)
  const search = normalize(q.search || "")
  const sortBy = q.sortBy || "name"
  const sortDir: SortDir = q.sortDir || "asc"

  let items = [...load()]

  if (search) {
    items = items.filter(p => normalize(p.name).includes(search))
  }

  items.sort((a, b) => {
    const va: any = a[sortBy]
    const vb: any = b[sortBy]
    if (typeof va === "number" && typeof vb === "number") {
      return sortDir === "asc" ? va - vb : vb - va
    }
    const sa = String(va ?? "").toLowerCase()
    const sb = String(vb ?? "").toLowerCase()
    if (sa < sb) return sortDir === "asc" ? -1 : 1
    if (sa > sb) return sortDir === "asc" ? 1 : -1
    return 0
  })

  const total = items.length
  const start = (page - 1) * limit
  const end = start + limit

  return { items: items.slice(start, end), total }
}

export function mockUpsertProduct(p: ProductDto) {
  const items = load()
  const idx = items.findIndex(x => x._id === p._id)
  if (idx >= 0) items[idx] = { ...items[idx], ...p }
  else items.unshift(p)
  save(items)
}

export function mockRemoveProduct(id: string) {
  save(load().filter(x => x._id !== id))
}
