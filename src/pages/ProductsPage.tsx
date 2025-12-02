import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "../components/app-sidebar"
import { Button } from "../components/ui/button"
import { Separator } from "../components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar"
import { Input } from "../components/ui/input"
import { apiGetMe, apiLogout } from "../lib/api-auth"
import { DataTable, type ColumnDef } from "../components/data-table"
import { fetchProducts, createProduct, type ProductDto } from "../lib/api-products"

export default function ProductsPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    apiGetMe()
      .then(me => setEmail(me.email))
      .catch(() => setEmail(null))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchProducts()
      .then(data => setProducts(data))
      .catch(e => setError(e.message ?? "Error al cargar productos"))
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    apiLogout()
    nav("/login", { replace: true })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const p = parseFloat(price)
    if (!name || !price || Number.isNaN(p)) {
      setFormError("Nombre y precio son obligatorios, el precio debe ser numérico")
      return
    }

    setSaving(true)
    try {
      const created = await createProduct({ name, price: p, description: description || undefined })
      setProducts(prev => [created, ...prev])
      setName("")
      setPrice("")
      setDescription("")
      setShowForm(false)
    } catch (err: any) {
      setFormError(err?.message ?? "No se pudo crear el producto")
    } finally {
      setSaving(false)
    }
  }

  const columns: ColumnDef<ProductDto>[] = [
    { key: "name", header: "Nombre", sortable: true },
    {
      key: "price",
      header: "Precio",
      sortable: true,
      render: row => `$${row.price.toFixed(2)}`,
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Panel</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Productos</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="ml-auto flex items-center gap-3 px-4">
            {email && (
              <span className="text-sm text-muted-foreground">
                Sesión: {email}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Listado de productos</h2>
            <Button size="sm" onClick={() => setShowForm(s => !s)}>
              {showForm ? "Cancelar" : "Agregar producto"}
            </Button>
          </div>

          {showForm && (
            <form className="grid gap-3 rounded-md border p-4 md:grid-cols-4" onSubmit={handleCreate}>
              <div className="md:col-span-2">
                <Input
                  placeholder="Nombre"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Precio"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
              <div className="md:col-span-4">
                <Input
                  placeholder="Descripción (opcional)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              {formError && (
                <div className="md:col-span-4">
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              )}
              <div className="md:col-span-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Cerrar
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          )}

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <DataTable<ProductDto>
            data={products}
            columns={columns}
            searchableKeys={["name"]}
            searchPlaceholder="Buscar producto..."
            emptyMessage="No hay productos"
            loading={loading}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
