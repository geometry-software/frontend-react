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
import { apiGetMe, apiLogout } from "../lib/api-auth"
import { DataTable, type ColumnDef } from "../components/data-table"
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductDto,
} from "../lib/api-products"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"

type FormMode = "create" | "edit"

export default function ProductsPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>("create")
  const [currentProduct, setCurrentProduct] = useState<ProductDto | null>(null)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailProduct, setDetailProduct] = useState<ProductDto | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  function openCreate() {
    setFormMode("create")
    setCurrentProduct(null)
    setName("")
    setPrice("")
    setDescription("")
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(p: ProductDto) {
    setFormMode("edit")
    setCurrentProduct(p)
    setName(p.name)
    setPrice(String(p.price))
    setDescription(p.description || "")
    setFormError(null)
    setFormOpen(true)
  }

  function openDetails(p: ProductDto) {
    setDetailProduct(p)
    setDetailOpen(true)
  }

  function openDelete(p: ProductDto) {
    setDeleteTarget(p)
    setDeleteOpen(true)
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const p = parseFloat(price)
    if (!name || !price || Number.isNaN(p)) {
      setFormError("Nombre y precio son obligatorios, el precio debe ser numérico")
      return
    }

    setSaving(true)
    try {
      if (formMode === "create") {
        const created = await createProduct({
          name,
          price: p,
          description: description || undefined,
        })
        setProducts(prev => [created, ...prev])
      } else if (formMode === "edit" && currentProduct) {
        const updated = await updateProduct(currentProduct._id, {
          name,
          price: p,
          description: description || undefined,
        })
        setProducts(prev =>
          prev.map(x => (x._id === updated._id ? updated : x))
        )
      }
      setFormOpen(false)
    } catch (err: any) {
      setFormError(err?.message ?? "No se pudo guardar el producto")
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProduct(deleteTarget._id)
      setProducts(prev => prev.filter(x => x._id !== deleteTarget._id))
      setDeleteOpen(false)
      setDeleteTarget(null)
    } catch (err: any) {
      console.error(err)
    } finally {
      setDeleting(false)
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
    {
      key: "_id",
      header: "Acciones",
      render: row => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDetails(row)}
          >
            Detalle
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEdit(row)}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => openDelete(row)}
          >
            Eliminar
          </Button>
        </div>
      ),
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
            <Button size="sm" onClick={openCreate}>
              Agregar producto
            </Button>
          </div>

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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Agregar producto" : "Editar producto"}
            </DialogTitle>
            <DialogDescription>
              Completa los campos y guarda los cambios.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmitForm}>
            <div className="space-y-2">
              <Label htmlFor="prod-name">Nombre</Label>
              <Input
                id="prod-name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-price">Precio</Label>
              <Input
                id="prod-price"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-desc">Descripción</Label>
              <Input
                id="prod-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Guardando..."
                  : formMode === "create"
                  ? "Crear"
                  : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle del producto</DialogTitle>
            <DialogDescription>
              Información básica del producto.
            </DialogDescription>
          </DialogHeader>
          {detailProduct && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="text-sm font-mono break-all">
                  {detailProduct._id}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="text-sm">{detailProduct.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Precio</p>
                <p className="text-sm">${detailProduct.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Descripción</p>
                <p className="text-sm">
                  {detailProduct.description || "Sin descripción"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setDetailOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar este producto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteOpen(false)
                setDeleteTarget(null)
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
