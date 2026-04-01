import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { apiRegister } from "../lib/api-auth"

export function SignupForm() {
  const nav = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setOk(false); setLoading(true)
    try {
      if (!email || !password) throw new Error("Complete email and password")
      await apiRegister(email, password)
      setOk(true)
      setTimeout(() => nav("/login"), 900)
    } catch (e: any) {
      setError(e.message ?? "Could not register")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-green-600">Account created, redirecting…</p>}
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear cuenta"}
      </Button>
      <p className="text-sm text-center">
        Do you already have an account? <Link to="/login" className="underline">Login</Link>
      </p>
    </form>
  )
}
