import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { mockRegister, type Role } from "../lib/mock-auth"

export function SignupForm() {
  const nav = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("user")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setOk(false); setLoading(true)
    try {
      if (!email || !password) throw new Error("Completa email y contraseña")
      await mockRegister({ name, email, password, role })
      setOk(true)
      setTimeout(() => nav("/login"), 900)
    } catch (e: any) {
      setError(e.message ?? "No se pudo registrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" value={name} onChange={e=>setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <select
          id="role"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={role}
          onChange={(e)=>setRole(e.target.value as Role)}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-green-600">Cuenta creada, redirigiendo…</p>}
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear cuenta"}
      </Button>
      <p className="text-sm text-center">
        ¿Ya tienes cuenta? <Link to="/login" className="underline">Entrar</Link>
      </p>
    </form>
  )
}
