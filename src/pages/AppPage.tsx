import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { apiGetMe, apiLogout } from "../lib/api-auth"

export default function AppPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    apiGetMe().then((me) => setEmail(me.email)).catch(() => setEmail(null))
  }, [])

  function handleLogout() {
    apiLogout()
    nav("/login", { replace: true })
  }

  return (
    <div className="min-h-svh">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="text-sm text-muted-foreground">
          {email ? `Sesión: ${email}` : "Sesión iniciada"}
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </header>

      <main className="flex min-h-[calc(100svh-65px)] items-center justify-center p-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold">Welcome to SevenFox🎉</h1>
          <p className="text-muted-foreground">You are logged in</p>
        </div>
      </main>
    </div>
  )
}
