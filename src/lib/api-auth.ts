const BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || ""

function getToken(): string | null {
  return localStorage.getItem("auth:token")
}

function setToken(t: string | null) {
  if (t) localStorage.setItem("auth:token", t)
  else localStorage.removeItem("auth:token")
}

function pickToken(obj: any): string | null {
  if (!obj || typeof obj !== "object") return null
  return obj.accessToken || obj.token || obj.jwt || null
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })
  let data: any = null
  try { data = await res.json() } catch {}
  if (!res.ok) {
    const msg = data?.message || data?.error || "Error de red"
    throw new Error(Array.isArray(msg) ? msg[0] : String(msg))
  }
  return data as T
}

export async function apiRegister(email: string, password: string) {
  return jsonFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function apiLogin(email: string, password: string) {
  const data = await jsonFetch<any>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  const token = pickToken(data)
  if (!token) throw new Error("El servidor no devolvió un token")
  setToken(token)
  return { accessToken: token }
}

export function apiLogout() {
  setToken(null)
}

export async function apiGetMe(): Promise<{ id?: string | number; email: string }> {
  const token = getToken()
  if (!token) throw new Error("No autenticado")
  
  try {
    const [, payload] = token.split(".")
    if (payload) {
      const obj = JSON.parse(atob(payload))
      return { id: obj.sub ?? obj.id, email: obj.email }
    }
  } catch {}

  return { email: "usuario@autenticado" }
}

export function authHeader(): Record<string, string> {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}
