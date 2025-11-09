import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { mockLogin } from "../lib/mock-auth"
import { Github } from "lucide-react"

export function LoginForm() {
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
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

  async function handleGitHubLogin() {
    setLoading(true)
    setError(null)
    try {
      // Modo mock: login automático con cuenta simulada
      await mockLogin({ email: "github@mock.com", password: "github" })
      nav("/", { replace: true })
    } catch (e: any) {
      setError(e.message ?? "Error con GitHub")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">o</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGitHubLogin}
        disabled={loading}
      >
        <Github className="size-4" />
        {loading ? "Conectando..." : "Entrar con GitHub"}
      </Button>

      <p className="text-sm text-center">
        ¿No tienes cuenta?{" "}
        <Link to="/signup" className="underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  )
}
