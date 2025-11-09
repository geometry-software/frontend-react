import baseUsers from "../data/data.json"

export type Role = "admin" | "user"
export type User = { id: string; email: string; name?: string; role: Role; password: string }

const EXTRA_USERS_KEY = "mock:extraUsers"
const TOKEN_KEY = "auth:token"

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

function loadExtraUsers(): User[] {
  try { return JSON.parse(localStorage.getItem(EXTRA_USERS_KEY) || "[]") } catch { return [] }
}
function saveExtraUsers(users: User[]) {
  localStorage.setItem(EXTRA_USERS_KEY, JSON.stringify(users))
}

function allUsers(): User[] {
  
  return [...(baseUsers as User[]), ...loadExtraUsers()]
}

export async function mockRegister(opts: { email: string; password: string; name?: string; role?: Role }) {
  await sleep(500)
  const users = allUsers()
  const exists = users.some(u => u.email.toLowerCase() === opts.email.toLowerCase())
  if (exists) throw new Error("El email ya está registrado")

  const newUser: User = {
    id: crypto.randomUUID(),
    email: opts.email,
    password: opts.password,
    name: opts.name || "",
    role: opts.role || "user",
  }

  const extras = loadExtraUsers()
  extras.push(newUser)
  saveExtraUsers(extras)
  return { ok: true }
}

export async function mockLogin(opts: { email: string; password: string }) {
  await sleep(500)
  const user = allUsers().find(u => u.email.toLowerCase() === opts.email.toLowerCase())
  if (!user || user.password !== opts.password) {
    throw new Error("Credenciales inválidas")
  }

  const payload = { sub: user.id, email: user.email, role: user.role }
  const accessToken = btoa(JSON.stringify(payload))
  localStorage.setItem(TOKEN_KEY, accessToken)
  return { accessToken }
}

export async function mockGetMe() {
  await sleep(300)
  const tok = localStorage.getItem(TOKEN_KEY)
  if (!tok) throw new Error("No autenticado")
  let payload: { sub: string; email: string; role: Role }
  try { payload = JSON.parse(atob(tok)) } catch { throw new Error("Token inválido") }
  const user = allUsers().find(u => u.id === payload.sub)
  if (!user) throw new Error("No autenticado")
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export function mockLogout() {
  localStorage.removeItem(TOKEN_KEY)
}
