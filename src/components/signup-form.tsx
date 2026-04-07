import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { apiRegister } from "../lib/api-auth"

export function SignupForm() {
  const nav = useNavigate()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setOk(false); setLoading(true)
    try {
      if (!firstName || !lastName || !email || !password) throw new Error("Complete todos los campos")
      await apiRegister(firstName, lastName, email, password)
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
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ej. Carlos" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Ej. Pérez" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@ejemplo.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      {ok && <p className="text-sm text-green-600 font-medium italic">Cuenta creada, redirigiendo...</p>}
      <Button className="w-full cursor-pointer" type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear cuenta"}
      </Button>
      <p className="text-sm text-center">
        Do you already have an account? <Link to="/login" className="underline">Login</Link>
      </p>
    </form>
  )
}
