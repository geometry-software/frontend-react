import { authHeader } from "./api-auth"
import type {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  UsersQuery,
} from "../types/users"

const BASE =
  import.meta.env.VITE_USERS_URL?.replace(/\/+$/, "") ||
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  ""

const USE_MOCK = true

const MOCK_USERS: UserDto[] = [
  {
    _id: "usr-001",
    firstName: "Carlos",
    lastName: "Martínez",
    email: "carlos@sevenfox.com",
    createdAt: "2025-11-15T10:30:00.000Z",
    updatedAt: "2026-03-20T14:00:00.000Z",
  },
  {
    _id: "usr-002",
    firstName: "Maria",
    lastName: "González",
    email: "maria@sevenfox.com",
    createdAt: "2025-12-01T08:00:00.000Z",
    updatedAt: "2026-02-28T09:30:00.000Z",
  },
  {
    _id: "usr-003",
    firstName: "José",
    lastName: "Rodríguez",
    email: "jose@sevenfox.com",
    createdAt: "2026-01-10T12:15:00.000Z",
    updatedAt: "2026-03-10T16:45:00.000Z",
  },
  {
    _id: "usr-004",
    firstName: "Ana",
    lastName: "López",
    email: "ana@sevenfox.com",
    createdAt: "2026-02-05T09:00:00.000Z",
    updatedAt: "2026-03-15T11:20:00.000Z",
  },
  {
    _id: "usr-005",
    firstName: "Pedro",
    lastName: "Hernández",
    email: "pedro@sevenfox.com",
    createdAt: "2026-02-20T07:30:00.000Z",
    updatedAt: "2026-03-18T13:00:00.000Z",
  },
  {
    _id: "usr-006",
    firstName: "Laura",
    lastName: "Díaz",
    email: "laura@sevenfox.com",
    createdAt: "2026-03-01T14:00:00.000Z",
    updatedAt: "2026-03-25T10:00:00.000Z",
  },
  {
    _id: "usr-007",
    firstName: "Miguel",
    lastName: "Torres",
    email: "miguel@sevenfox.com",
    createdAt: "2026-01-25T16:00:00.000Z",
    updatedAt: "2026-03-22T08:45:00.000Z",
  },
  {
    _id: "usr-008",
    firstName: "Sofía",
    lastName: "Ramírez",
    email: "sofia@sevenfox.com",
    createdAt: "2026-03-05T11:30:00.000Z",
    updatedAt: "2026-03-26T15:10:00.000Z",
  },
]

let mockDb = [...MOCK_USERS]
let nextMockId = 9

function buildQueryString(q: UsersQuery) {
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
  } catch { }

  if (!res.ok) {
    console.error(`Fetch API Error (${res.status}):`, data)
    const msg = data?.message || data?.error || "Error de red"
    throw new Error(Array.isArray(msg) ? msg[0] : String(msg))
  }

  return data as T
}

function normalizeListResponse(raw: any): { items: UserDto[]; total: number } {
  if (Array.isArray(raw))
    return { items: raw as UserDto[], total: raw.length }

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

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms))
}

async function mockFetchUsers(
  query: UsersQuery
): Promise<{ items: UserDto[]; total: number }> {
  await delay()
  let filtered = [...mockDb]

  if (query.query) {
    const q = query.query.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    )
  }

  if (query.createdAtFrom) {
    const from = new Date(query.createdAtFrom).getTime()
    filtered = filtered.filter(
      (u) => u.createdAt && new Date(u.createdAt).getTime() >= from
    )
  }
  if (query.createdAtTo) {
    const to = new Date(query.createdAtTo).getTime()
    filtered = filtered.filter(
      (u) => u.createdAt && new Date(u.createdAt).getTime() <= to
    )
  }

  const sortBy = (query.sortBy || "createdAt") as keyof UserDto
  const sortDir = query.sortOrder === "asc" ? 1 : -1
  filtered.sort((a, b) => {
    const av = a[sortBy] ?? ""
    const bv = b[sortBy] ?? ""
    if (av < bv) return -1 * sortDir
    if (av > bv) return 1 * sortDir
    return 0
  })

  const total = filtered.length
  const page = query.page ?? 1
  const limit = query.limit ?? 10
  const start = (page - 1) * limit
  const items = filtered.slice(start, start + limit)
  return { items, total }
}

async function mockCreateUser(dto: CreateUserDto): Promise<UserDto> {
  await delay()
  const now = new Date().toISOString()
  const user: UserDto = {
    _id: `usr-${String(nextMockId++).padStart(3, "0")}`,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    createdAt: now,
    updatedAt: now,
  }
  mockDb.unshift(user)
  return user
}

async function mockUpdateUser(
  id: string,
  dto: UpdateUserDto
): Promise<UserDto> {
  await delay()
  const idx = mockDb.findIndex((u) => u._id === id)
  if (idx === -1) {
  
    const now = new Date().toISOString()
    const newUser: UserDto = {
        _id: id,
        firstName: dto.firstName || "Usuario",
        lastName: dto.lastName || "Real",
        email: dto.email || "correo@ejemplo.com",
        createdAt: now,
        updatedAt: now
    }
    mockDb.push(newUser)
    return newUser
  }
  const updated: UserDto = {
    ...mockDb[idx],
    ...dto,
    updatedAt: new Date().toISOString(),
  }
  mockDb[idx] = updated
  return updated
}

async function mockDeleteUser(id: string): Promise<{ ok: boolean }> {
  await delay()
  const idx = mockDb.findIndex((u) => u._id === id)
  if (idx === -1) throw new Error("Usuario no encontrado")
  mockDb.splice(idx, 1)
  return { ok: true }
}

async function mockGetUser(id: string): Promise<UserDto> {
  await delay()
  const user = mockDb.find((u) => u._id === id)
  if (!user) {
     
      return {
          _id: id,
          firstName: "Usuario",
          lastName: "Backend",
          email: "usuario@ejemplo.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      }
  }
  return { ...user }
}

export async function fetchUsers(
  query: UsersQuery
): Promise<{ items: UserDto[]; total: number }> {
  if (USE_MOCK) return mockFetchUsers(query)
  const qs = buildQueryString(query)
  const raw = await jsonFetch<any>(`/users${qs}`, { method: "GET" })
  return normalizeListResponse(raw)
}

export async function createUser(dto: CreateUserDto): Promise<UserDto> {
  if (USE_MOCK) return mockCreateUser(dto)
  return jsonFetch<UserDto>("/users", {
    method: "POST",
    body: JSON.stringify(dto),
  })
}

export async function updateUser(
  id: string,
  dto: UpdateUserDto
): Promise<UserDto> {
  if (USE_MOCK) return mockUpdateUser(id, dto)
  return jsonFetch<UserDto>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  })
}

export async function deleteUser(id: string): Promise<{ ok?: boolean }> {
  if (USE_MOCK) return mockDeleteUser(id)
  return jsonFetch<{ ok?: boolean }>(`/users/${id}`, { method: "DELETE" })
}

export async function getUser(id: string): Promise<UserDto> {
  if (USE_MOCK) return mockGetUser(id)
  return jsonFetch<UserDto>(`/users/${id}`, { method: "GET" })
}
