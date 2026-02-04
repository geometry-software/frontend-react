import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "../components/dashboard-layout"
import { Button } from "../components/ui/button"
import { DataTable, type ColumnDef } from "../components/data-table"
import {
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

import ProductsFiltersSheet from "../components/products/products-filters-sheet"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import {
  fetchProductsPage,
  refreshProductsSilently,
  setPage,
  setLimit,
  setSort,
  setFilters,
  clearFilters,
} from "../features/products/productsSlice"

type FormMode = "create" | "edit"

export default function ProductsPage() {
  const dispatch = useAppDispatch()
  const { items, total, page, limit, sortBy, sortDir, filters, loading, error } =
    useAppSelector(s => s.products)

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
    dispatch(fetchProductsPage())
  }, [
    dispatch,
    page,
    limit,
    sortBy,
    sortDir,
    filters.text,
    filters.inName,
    filters.inDescription,
    filters.inPrice,
    filters.createdAtFrom,
    filters.createdAtTo,
  ])

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

    const trimmedName = name.trim()
    const trimmedPrice = price.trim()

    if (!trimmedName) {
      setFormError("El nombre es obligatorio")
      return
    }

    if (!trimmedPrice) {
      setFormError("El precio es obligatorio")
      return
    }

    const numericPrice = Number(trimmedPrice.replace(",", "."))
    if (Number.isNaN(numericPrice)) {
      setFormError("El precio debe ser numérico")
      return
    }

    setSaving(true)
    try {
      if (formMode === "create") {
        await createProduct({
          name: trimmedName,
          price: numericPrice,
          description: description.trim() || undefined,
        })
      } else if (formMode === "edit" && currentProduct) {
        await updateProduct(currentProduct._id, {
          name: trimmedName,
          price: numericPrice,
          description: description.trim() || undefined,
        })
      }

      setFormOpen(false)
      setCurrentProduct(null)
      dispatch(refreshProductsSilently())
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
      setDeleteOpen(false)
      setDeleteTarget(null)
      dispatch(refreshProductsSilently())
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo<ColumnDef<ProductDto>[]>(() => {
    return [
      { key: "name", header: "Nombre", sortable: true },
      {
        key: "price",
        header: "Precio",
        sortable: true,
        render: row => `$${row.price.toFixed(2)}`,
      },
      {
        key: "actions",
        header: "Acciones",
        headerNode: (
          <div className="flex justify-end pr-4">
            <div className="min-w-[220px] flex justify-center">Acciones</div>
          </div>
        ),
        cellClassName: "text-right pr-4",
        render: row => (
          <div className="flex justify-end">
            <div className="min-w-[220px] flex justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={() => openDetails(row)}
              >
                Detalle
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={() => openEdit(row)}
              >
                Editar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="cursor-pointer"
                onClick={() => openDelete(row)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        ),
      },
    ]
  }, [])

  return (
    <DashboardLayout pageTitle="Productos">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Listado de productos</h2>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <DataTable<ProductDto>
        serverSide
        data={items}
        total={total}
        page={page}
        pageSize={limit}
        sort={{ key: sortBy, dir: sortDir }}
        onPageChange={p => dispatch(setPage(p))}
        onPageSizeChange={n => dispatch(setLimit(n))}
        onSortChange={s => dispatch(setSort({ sortBy: String(s.key), sortDir: s.dir }))}
        columns={columns}
        emptyMessage="No hay productos"
        loading={loading}
        toolbarRight={
          <div className="flex items-center gap-2">
            <ProductsFiltersSheet
              value={filters}
              onApply={next => dispatch(setFilters(next))}
              onClear={() => dispatch(clearFilters())}
            />
            <Button size="sm" className="cursor-pointer" onClick={openCreate}>
              Agregar producto
            </Button>
          </div>
        }
      />

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

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setFormOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="cursor-pointer">
                {formMode === "create" ? "Crear" : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle del producto</DialogTitle>
            <DialogDescription>Información básica del producto.</DialogDescription>
          </DialogHeader>

          {detailProduct && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="text-sm font-mono break-all">{detailProduct._id}</p>
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
                <p className="text-sm">{detailProduct.description || "Sin descripción"}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              className="cursor-pointer"
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
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => {
                setDeleteOpen(false)
                setDeleteTarget(null)
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}


