import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api-client";
import { PageHeader } from "@/components/saas-layout";
import {
  AppBadge,
  AppButton,
  AppCard,
  AppInput,
  AppSectionHeader,
  AppSelect,
  AppTable,
  ConfirmDialog,
  EmptyState,
  FormField,
  InlineAlert,
  LoadingState,
} from "@/components/app-ui";
type Rol =
  | "admin"
  | "director"
  | "analista"
  | "unidad"
  | "financiero"
  | "bienes";
interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  activo: boolean;
  createdAt: string;
}
const rolLabel: Record<Rol, string> = {
  admin: "Administrador",
  director: "Director",
  analista: "Analista",
  unidad: "Unidad",
  financiero: "Financiero",
  bienes: "Bienes",
};
const usuariosColumns = [
  { key: "nombre", label: "Nombre", width: "34%" },
  { key: "correo", label: "Correo", width: "28%" },
  { key: "rol", label: "Rol", width: "15%" },
  { key: "estado", label: "Estado", width: "12%" },
  { key: "acciones", label: "Acciones", align: "right" as const, width: "11%" },
];
export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "unidad" as Rol,
  });
  const [editMode, setEditMode] = useState<{
    id: string;
    nombre: string;
    email: string;
    password: string;
    rol: Rol;
  } | null>(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(
    null,
  );
  const [usuarioEstadoPendiente, setUsuarioEstadoPendiente] =
    useState<Usuario | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ items: Usuario[]; totalItems: number }>(
        `/usuarios?page=${currentPage}&pageSize=${pageSize}`,
      );
      setUsuarios(data.items || []);
      setTotalUsuarios(Number(data.totalItems || 0));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);
  useEffect(() => {
    cargar();
  }, [cargar]);
  const crear = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.post<Usuario>("/usuarios", form);
      setForm({ nombre: "", email: "", password: "", rol: "unidad" });
      setMessage("Usuario creado correctamente");
      await cargar();
    } catch (err: any) {
      setMessage(err.message || "No se pudo crear el usuario");
    } finally {
      setSaving(false);
    }
  };
  const actualizar = async () => {
    if (!editMode) return;
    setSaving(true);
    setMessage("");
    try {
      const password = editMode.password.trim();
      await api.put<Usuario>(`/usuarios/${editMode.id}`, {
        nombre: editMode.nombre,
        email: editMode.email,
        rol: editMode.rol,
        ...(password ? { password } : {}),
      });
      setEditMode(null);
      setMessage("Usuario actualizado correctamente");
      await cargar();
    } catch (err: any) {
      setMessage(err.message || "No se pudo actualizar el usuario");
    } finally {
      setSaving(false);
    }
  };
  const toggleActivo = async () => {
    if (!usuarioEstadoPendiente) return;
    const usuario = usuarioEstadoPendiente;
    setChangingStatus(true);
    setMessage("");
    try {
      await api.put<Usuario>(`/usuarios/${usuario.id}`, {
        activo: !usuario.activo,
      });
      setMessage(usuario.activo ? "Usuario desactivado" : "Usuario activado");
      setUsuarioEstadoPendiente(null);
      await cargar();
    } catch (err: any) {
      setMessage(err.message || "No se pudo cambiar el estado del usuario");
    } finally {
      setChangingStatus(false);
    }
  };
  const eliminar = async () => {
    if (!usuarioAEliminar) return;
    setDeleting(true);
    setMessage("");
    try {
      await api.delete(`/usuarios/${usuarioAEliminar.id}`);
      setMessage("Usuario eliminado correctamente");
      setUsuarioAEliminar(null);
      await cargar();
    } catch (err: any) {
      setMessage(err.message || "No se pudo eliminar el usuario");
    } finally {
      setDeleting(false);
    }
  };
  const totalPages = Math.max(1, Math.ceil(totalUsuarios / pageSize));
  return (
    <div className="p-6">
      <PageHeader
        title="Usuarios"
        description="Administracion de accesos institucionales"
      />
      {message && <InlineAlert tone="info">{message}</InlineAlert>}
      <div className="space-y-6">
        <AppCard>
          <AppSectionHeader
            title={editMode ? "Editar usuario" : "Nuevo usuario"}
            description="Datos de acceso y rol operativo"
            className="-mx-5 -mt-5 mb-5"
          />
          <div className="max-w-5xl space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.1fr)_minmax(220px,1fr)_180px]">
              <FormField label="Nombre">
                <AppInput
                  value={editMode ? editMode.nombre : form.nombre}
                  onChange={(e) =>
                    editMode
                      ? setEditMode({ ...editMode, nombre: e.target.value })
                      : setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  type="text"
                  placeholder="Nombre completo"
                />
              </FormField>
              <FormField label="Correo">
                <AppInput
                  value={editMode ? editMode.email : form.email}
                  onChange={(e) =>
                    editMode
                      ? setEditMode({ ...editMode, email: e.target.value })
                      : setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="correo@ueb.edu.ec"
                  type="email"
                />
              </FormField>
              <FormField label="Rol">
                <AppSelect
                  value={editMode ? editMode.rol : form.rol}
                  onChange={(e) =>
                    editMode
                      ? setEditMode({ ...editMode, rol: e.target.value as Rol })
                      : setForm((f) => ({ ...f, rol: e.target.value as Rol }))
                  }
                >
                  {Object.entries(rolLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </AppSelect>
              </FormField>
              {!editMode && (
                <FormField
                  label="Contraseña temporal"
                  className="md:col-span-2 xl:col-span-1"
                >
                  <AppInput
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    type="password"
                    placeholder="Minimo 6 caracteres"
                  />
                </FormField>
              )}
              {editMode && (
                <FormField
                  label="Nueva contraseña"
                  description="Deje este campo vacío para conservar la contraseña actual"
                  className="md:col-span-2 xl:col-span-1"
                >
                  <AppInput
                    value={editMode.password}
                    onChange={(e) =>
                      setEditMode({ ...editMode, password: e.target.value })
                    }
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                  />
                </FormField>
              )}
            </div>
            <div className="flex flex-col justify-start gap-2 sm:flex-row">
              <AppButton
                type="button"
                variant="primary"
                onClick={editMode ? actualizar : crear}
                loading={saving}
                disabled={
                  saving ||
                  !(editMode
                    ? editMode.nombre &&
                      editMode.email &&
                      (!editMode.password || editMode.password.length >= 6)
                    : form.nombre && form.email && form.password.length >= 6)
                }
                className="app-button app-button-primary w-full whitespace-nowrap sm:w-auto"
              >
                {editMode ? "Actualizar usuario" : "Crear usuario"}
              </AppButton>
              {editMode && (
                <AppButton
                  type="button"
                  onClick={() => setEditMode(null)}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </AppButton>
              )}
            </div>
          </div>
        </AppCard>
        <AppCard padded={false}>
          <AppSectionHeader title="Usuarios registrados" />
          {loading ? (
            <LoadingState title="Cargando usuarios" />
          ) : usuarios.length === 0 ? (
            <EmptyState title="No hay usuarios registrados" />
          ) : (
            <>
              <AppTable
                columns={usuariosColumns}
                data={usuarios}
                getRowKey={(usuario) => usuario.id}
                mobileRender={(usuario) => (
                  <div className="space-y-3">
                    <div>
                      <p className="app-table-primary">{usuario.nombre}</p>
                      <p className="app-table-secondary">{usuario.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AppBadge>{rolLabel[usuario.rol]}</AppBadge>
                      <AppBadge tone={usuario.activo ? "success" : "danger"}>
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </AppBadge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AppButton
                        type="button"
                        size="sm"
                        onClick={() =>
                          setEditMode({
                            id: usuario.id,
                            nombre: usuario.nombre,
                            email: usuario.email,
                            password: "",
                            rol: usuario.rol,
                          })
                        }
                      >
                        Editar
                      </AppButton>
                      <AppButton
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setUsuarioEstadoPendiente(usuario)}
                        disabled={usuario.rol === "admin"}
                      >
                        {usuario.activo ? "Desactivar" : "Activar"}
                      </AppButton>
                      <AppButton
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => setUsuarioAEliminar(usuario)}
                        disabled={usuario.rol === "admin"}
                      >
                        Eliminar
                      </AppButton>
                    </div>
                  </div>
                )}
                minWidth={960}
                pagination={{
                  currentPage,
                  totalPages,
                  totalItems: totalUsuarios,
                  itemsPerPage: pageSize,
                  onPageChange: setCurrentPage,
                  onItemsPerPageChange: setPageSize,
                }}
              >
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="app-table-primary">{usuario.nombre}</td>
                    <td className="app-table-secondary">{usuario.email}</td>
                    <td>
                      <AppBadge>{rolLabel[usuario.rol]}</AppBadge>
                    </td>
                    <td>
                      <AppBadge tone={usuario.activo ? "success" : "danger"}>
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </AppBadge>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <AppButton
                          type="button"
                          size="sm"
                          onClick={() =>
                            setEditMode({
                              id: usuario.id,
                              nombre: usuario.nombre,
                              email: usuario.email,
                              password: "",
                              rol: usuario.rol,
                            })
                          }
                        >
                          Editar
                        </AppButton>
                        <div className="flex gap-1">
                          <AppButton
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setUsuarioEstadoPendiente(usuario)}
                            disabled={usuario.rol === "admin"}
                          >
                            {usuario.activo ? "Desactivar" : "Activar"}
                          </AppButton>
                          <AppButton
                            type="button"
                            size="sm"
                            variant="danger"
                            onClick={() => setUsuarioAEliminar(usuario)}
                            disabled={usuario.rol === "admin"}
                          >
                            Eliminar
                          </AppButton>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </AppTable>
            </>
          )}
        </AppCard>
      </div>
      <ConfirmDialog
        open={Boolean(usuarioAEliminar)}
        title="Eliminar usuario"
        description={
          usuarioAEliminar
            ? `¿Eliminar a ${usuarioAEliminar.nombre}? Esta acción no se puede deshacer.`
            : undefined
        }
        tone="danger"
        confirmText="Eliminar"
        loading={deleting}
        onConfirm={eliminar}
        onClose={() => {
          if (!deleting) setUsuarioAEliminar(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(usuarioEstadoPendiente)}
        title={
          usuarioEstadoPendiente?.activo
            ? "Desactivar usuario"
            : "Activar usuario"
        }
        description={
          usuarioEstadoPendiente
            ? `Está por ${usuarioEstadoPendiente.activo ? "desactivar" : "activar"} a ${usuarioEstadoPendiente.nombre}. Esto cambiará su acceso al sistema.`
            : undefined
        }
        tone={usuarioEstadoPendiente?.activo ? "warning" : "info"}
        confirmText={usuarioEstadoPendiente?.activo ? "Desactivar" : "Activar"}
        loading={changingStatus}
        onConfirm={toggleActivo}
        onClose={() => {
          if (!changingStatus) setUsuarioEstadoPendiente(null);
        }}
      />
    </div>
  );
}
