import { useEffect, useState } from "react"
import DashboardLayout from "../components/dashboard-layout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { apiGetMe } from "../lib/api-auth"
import { updateUser, getUser } from "../lib/api-users"
import type { UserDto } from "../types/users"

export default function ProfilePage() {
  const [user, setUser] = useState<UserDto | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    console.log("Iniciando carga de perfil...")
    apiGetMe()
      .then((me) => {
        console.log("apiGetMe devolvió:", me)
        if (!me.id) {
          console.error("No se encontró ID en me:", me)
          throw new Error("No user ID found")
        }
        return getUser(String(me.id))
      })
      .then((u) => {
        console.log("getUser devolvió:", u)
        setUser(u)
        setFirstName(u.firstName)
        setLastName(u.lastName)
        setEmail(u.email)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error en la cadena de carga de perfil:", err)
        setError(`Error al cargar el perfil: ${err.message || String(err)}`)
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError(null)
    setOk(false)

    try {
      await updateUser(user._id, {
        firstName,
        lastName,
        email,
        ...(password.trim() ? { password: password.trim() } : {}),
      })
      setOk(true)
    } catch (err: any) {
      setError(err?.message ?? "Error al actualizar el perfil")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <DashboardLayout pageTitle="Mi Perfil">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Datos Personales</h2>
            <p className="text-sm text-muted-foreground">Puedes actualizar tu información aquí.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña (opcional)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {ok && <p className="text-sm text-green-600">Perfil actualizado corregidamente.</p>}

            <div className="pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
