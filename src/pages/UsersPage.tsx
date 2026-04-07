import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "../components/dashboard-layout"
import { Button } from "../components/ui/button"
import { DataTable, type ColumnDef } from "../components/data-table"
import {
  createUser,
  updateUser,
  deleteUser,
} from "../lib/api-users"
import type { UserDto } from "../types/users"
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
import UsersFiltersSheet from "../components/users/users-filters-sheet"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import {
  fetchUsersPage,
  setPage,
  setLimit,
  setSort,
  setFilters,
  clearFilters,
} from "../features/users/usersSlice"
import { fmtDate } from "../lib/utils"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6



export default function UsersPage() {
  const dispatch = useAppDispatch()
  const { items, total, page, limit, sortBy, sortDir, filters, loading, error } =
    useAppSelector((s) => s.users)


  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)


  const [detailOpen, setDetailOpen] = useState(false)
  const [detailUser, setDetailUser] = useState<UserDto | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editFirstName, setEditFirstName] = useState("")
  const [editLastName, setEditLastName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)


  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    dispatch(fetchUsersPage())
  }, [dispatch, page, limit, sortBy, sortDir, filters])


  const openCreate = () => {
    setFormMode("create")
    setCurrentUser(null)
    setFirstName("")
    setLastName("")
    setEmail("")
    setPassword("")
    setFormError(null)
    setFormOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const trimFirst = firstName.trim()
    const trimLast = lastName.trim()
    const trimEmail = email.trim()
    const trimPass = password.trim()

    if (!trimFirst) return setFormError("El nombre es obligatorio")
    if (!trimLast) return setFormError("El apellido es obligatorio")
    if (!trimEmail) return setFormError("El correo es obligatorio")
    if (!EMAIL_REGEX.test(trimEmail))
      return setFormError("El formato del correo no es válido")

    if (formMode === "create" && !trimPass) {
      return setFormError("La contraseña es obligatoria")
    }
    if (trimPass && trimPass.length < MIN_PASSWORD_LENGTH) {
      return setFormError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
    }

    setSaving(true)
    try {
      if (formMode === "create") {
        await createUser({
          firstName: trimFirst,
          lastName: trimLast,
          email: trimEmail,
          password: trimPass,
        })
      } else if (formMode === "edit" && currentUser) {
        await updateUser(currentUser._id, {
          firstName: trimFirst,
          lastName: trimLast,
          email: trimEmail,
          ...(trimPass ? { password: trimPass } : {}),
        })
      }

      setFormOpen(false)
      dispatch(fetchUsersPage())
    } catch (err: any) {
      setFormError(err?.message ?? "No se pudo guardar el usuario")
    } finally {
      setSaving(false)
    }
  }


  const openDetails = (u: UserDto) => {
    setDetailUser(u)
    setIsEditing(false)
    setEditError(null)

    setEditFirstName(u.firstName)
    setEditLastName(u.lastName)
    setEditEmail(u.email)
    setEditPassword("")
    setDetailOpen(true)
  }

  const enableEdit = () => {
    if (!detailUser) return
    setEditFirstName(detailUser.firstName)
    setEditLastName(detailUser.lastName)
    setEditEmail(detailUser.email)
    setEditPassword("")
    setEditError(null)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditError(null)
  }

  const handleSaveEdit = async () => {
    if (!detailUser) return
    setEditError(null)

    const trimFirst = editFirstName.trim()
    const trimLast = editLastName.trim()
    const trimEmail = editEmail.trim()
    const trimPass = editPassword.trim()

    if (!trimFirst) return setEditError("El nombre es obligatorio")
    if (!trimLast) return setEditError("El apellido es obligatorio")
    if (!trimEmail) return setEditError("El correo es obligatorio")
    if (!EMAIL_REGEX.test(trimEmail))
      return setEditError("El formato del correo no es válido")
    if (trimPass && trimPass.length < MIN_PASSWORD_LENGTH)
      return setEditError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)

    setEditSaving(true)
    try {
      await updateUser(detailUser._id, {
        firstName: trimFirst,
        lastName: trimLast,
        email: trimEmail,
        ...(trimPass ? { password: trimPass } : {}),
      })
      setDetailOpen(false)
      dispatch(fetchUsersPage())
    } catch (err: any) {
      setEditError(err?.message ?? "No se pudo guardar")
    } finally {
      setEditSaving(false)
    }
  }


  const openDelete = (u: UserDto) => {
    setDeleteTarget(u)
    setDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget._id)
      setDeleteOpen(false)
      dispatch(fetchUsersPage())
    } finally {
      setDeleting(false)
    }
  }


  const columns: ColumnDef<UserDto>[] = useMemo(
    () => [
      {
        key: "firstName",
        header: "Nombre",
        sortable: true,
        render: (row) => `${row.firstName} ${row.lastName}`,
      },
      { key: "email", header: "Correo", sortable: true },

      {
        key: "createdAt",
        header: "Registrado",
        sortable: true,
        render: (row) => fmtDate(row.createdAt),
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
        render: (row) => (
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
    ],
    []
  )

  return (
    <DashboardLayout pageTitle="Usuarios">
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
          {error}
        </p>
      )}

      <DataTable<UserDto>
        serverSide
        data={items}
        total={total}
        page={page}
        pageSize={limit}
        sort={{ key: sortBy, dir: sortDir }}
        onPageChange={(p) => dispatch(setPage(p))}
        onPageSizeChange={(n) => dispatch(setLimit(n))}
        onSortChange={(s) => dispatch(setSort({ sortBy: s.key, sortDir: s.dir }))}
        columns={columns}
        emptyMessage="No hay usuarios registrados"
        loading={loading}
        toolbarRight={
          <div className="flex items-center gap-2">
            <UsersFiltersSheet
              value={filters}
              onApply={(next) => dispatch(setFilters(next))}
              onClear={() => dispatch(clearFilters())}
            />
            <Button size="sm" className="cursor-pointer" onClick={openCreate}>
              Agregar usuario
            </Button>
          </div>
        }
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar usuario</DialogTitle>
            <DialogDescription>
              Completa los datos del nuevo usuario.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmitForm}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-firstname">Nombre</Label>
                <Input
                  id="user-firstname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Carlos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-lastname">Apellido</Label>
                <Input
                  id="user-lastname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej. Martínez"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Correo</Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@correo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Contraseña</Label>
              <Input
                id="user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {formError && (
              <p className="text-sm text-red-600 font-medium">{formError}</p>
            )}
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
                {saving ? "Guardando..." : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) setIsEditing(false)
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar usuario" : "Detalle del usuario"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los campos y guarda los cambios."
                : "Información registrada del usuario. Haz clic en Editar para modificar."}
            </DialogDescription>
          </DialogHeader>

          {detailUser && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">ID</Label>
                <Input
                  value={detailUser._id}
                  disabled
                  className="font-mono text-sm bg-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nombre</Label>
                  <Input
                    value={isEditing ? editFirstName : detailUser.firstName}
                    disabled={!isEditing}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>


                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Apellido</Label>
                  <Input
                    value={isEditing ? editLastName : detailUser.lastName}
                    disabled={!isEditing}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
              </div>


              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Correo</Label>
                <Input
                  value={isEditing ? editEmail : detailUser.email}
                  disabled={!isEditing}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>





              {isEditing && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Nueva contraseña{" "}
                    <span className="text-muted-foreground italic">
                      (dejar vacío para no cambiar)
                    </span>
                  </Label>
                  <Input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              )}


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Registrado
                  </Label>
                  <Input
                    value={fmtDate(detailUser.createdAt)}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Actualizado
                  </Label>
                  <Input
                    value={fmtDate(detailUser.updatedAt)}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              {editError && (
                <p className="text-sm text-red-600 font-medium">{editError}</p>
              )}
            </div>
          )}

          <DialogFooter>
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={cancelEdit}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={handleSaveEdit}
                  disabled={editSaving}
                >
                  {editSaving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setDetailOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={enableEdit}
                >
                  Editar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al usuario{" "}
              <strong>
                {deleteTarget?.firstName} {deleteTarget?.lastName}
              </strong>
              . No puedes deshacer esta operación.
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
              {deleting ? "Eliminando..." : "Sí, eliminar usuario"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
