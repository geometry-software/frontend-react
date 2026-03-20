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
  setPage,
  setLimit,
  setSort,
  setFilters,
  clearFilters,
} from "../features/products/productsSlice"
import { fmtDate } from "../lib/utils"

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
  }, [dispatch, page, limit, sortBy, sortDir, filters])


  const openCreate = () => {
    setFormMode("create")
    setCurrentProduct(null)
    setName("")
    setPrice("")
    setDescription("")
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (p: ProductDto) => {
    setFormMode("edit")
    setCurrentProduct(p)
    setName(p.name)
    setPrice(String(p.price))
    setDescription(p.description || "")
    setFormError(null)
    setFormOpen(true)
  }

  const openDetails = (p: ProductDto) => {
    setDetailProduct(p)
    setDetailOpen(true)
  }

  const openDelete = (p: ProductDto) => {
    setDeleteTarget(p)
    setDeleteOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const trimmedName = name.trim()
    const trimmedPrice = price.trim()

    if (!trimmedName) return setFormError("El nombre es obligatorio")
    if (!trimmedPrice) return setFormError("El precio es obligatorio")

    const numericPrice = Number(trimmedPrice.replace(",", "."))
    if (Number.isNaN(numericPrice)) return setFormError("El precio debe ser numérico")

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
      dispatch(fetchProductsPage())
    } catch (err: any) {
      setFormError(err?.message ?? "No se pudo guardar el producto")
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProduct(deleteTarget._id)
      setDeleteOpen(false)
      dispatch(fetchProductsPage())
    } finally {
      setDeleting(false)
    }
  }

  const columns: ColumnDef<ProductDto>[] = useMemo(
    () => [
      { key: "name", header: "Nombre", sortable: true },
      {
        key: "price",
        header: "Precio",
        sortable: true,
        render: row => `$${row.price.toFixed(2)}`,
      },
      {
        key: "updatedAt",
        header: "Actualizado",
        sortable: true,
        render: row => fmtDate(row.updatedAt),
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
              <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => openDetails(row)}>
                Detalle
              </Button>
              <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => openEdit(row)}>
                Editar
              </Button>
              <Button size="sm" variant="destructive" className="cursor-pointer" onClick={() => openDelete(row)}>
                Eliminar
              </Button>
            </div>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <DashboardLayout pageTitle="Productos">
      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{error}</p>}

      <DataTable<ProductDto>
        serverSide
        data={items}
        total={total}
        page={page}
        pageSize={limit}
        sort={{ key: sortBy, dir: sortDir }}
        onPageChange={p => dispatch(setPage(p))}
        onPageSizeChange={n => dispatch(setLimit(n))}
        onSortChange={s => dispatch(setSort({ sortBy: s.key, sortDir: s.dir }))}
        columns={columns}
        emptyMessage="No hay productos disponibles"
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
              Completa los detalles del producto a continuación.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmitForm}>
            <div className="space-y-2">
              <Label htmlFor="prod-name">Nombre</Label>
              <Input id="prod-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Material A" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-price">Precio ($)</Label>
              <Input id="prod-price" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-desc">Descripción (opcional)</Label>
              <Input id="prod-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Información adicional..." />
            </div>
            {formError && <p className="text-sm text-red-600 font-medium">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="cursor-pointer">
                {saving ? "Guardando..." : formMode === "create" ? "Crear producto" : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

  
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalle del producto</DialogTitle>
            <DialogDescription>Información detallada registrada en el sistema.</DialogDescription>
          </DialogHeader>
          {detailProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-semibold text-muted-foreground">ID:</span>
                <span className="col-span-3 text-sm font-mono bg-muted p-1 rounded">{detailProduct._id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-semibold text-muted-foreground">Nombre:</span>
                <span className="col-span-3 text-sm">{detailProduct.name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-semibold text-muted-foreground">Precio:</span>
                <span className="col-span-3 text-sm font-medium text-green-600">${detailProduct.price.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="text-sm font-semibold text-muted-foreground">Descripción:</span>
                <span className="col-span-3 text-sm">{detailProduct.description || "Sin descripción proporcionada"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-semibold text-muted-foreground">Actualizado:</span>
                <span className="col-span-3 text-sm">{fmtDate(detailProduct.updatedAt)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" className="cursor-pointer w-full" onClick={() => setDetailOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el producto <strong>{deleteTarget?.name}</strong>. No puedes deshacer esta operación.
            </AlertDialogDescription>
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
              className="cursor-pointer bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Sí, eliminar producto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}


