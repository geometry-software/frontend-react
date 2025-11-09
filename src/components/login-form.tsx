import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { mockLogin } from "../lib/mock-auth"

export function LoginForm() {
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      if (!email || !password) throw new Error("Completa email y contraseña")
      await mockLogin({ email, password })
      nav("/", { replace: true })
    } catch (e: any) {
      setError(e.message ?? "Error de autenticación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
      <p className="text-sm text-center">
        ¿No tienes cuenta? <Link to="/signup" className="underline">Crear cuenta</Link>
      </p>
    </form>
  )
}
