import { useEffect, useState, useCallback } from "react";
import { Button } from "@heroui/react";
import { Loader, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/services/api-client";
import {
  InlineMessage,
  PageHeader,
  SectionCard,
} from "@/components/saas-layout";
import { AppBadge, AppTable } from "@/components/app-ui";
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
    rol: Rol;
  } | null>(null);
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
      await api.put<Usuario>(`/usuarios/${editMode.id}`, {
        nombre: editMode.nombre,
        email: editMode.email,
        rol: editMode.rol,
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
  const toggleActivo = async (usuario: Usuario) => {
    setMessage("");
    try {
      await api.put<Usuario>(`/usuarios/${usuario.id}`, {
        activo: !usuario.activo,
      });
      setMessage(usuario.activo ? "Usuario desactivado" : "Usuario activado");
      await cargar();
    } catch (err: any) {
      setMessage(err.message || "No se pudo cambiar el estado del usuario");
    }
  };
  const eliminar = async (usuario: Usuario) => {
    if (
      !confirm(
        `¿Eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`,
      )
    )
      return;
    setSaving(true);
    setMessage("");
    try {
      await api.delete(`/usuarios/${usuario.id}`);
      setMessage("Usuario eliminado correctamente");
      await cargar();
    } catch (err: any) {
      setMessage(err.message || "No se pudo eliminar el usuario");
    } finally {
      setSaving(false);
    }
  };
  const totalPages = Math.max(1, Math.ceil(totalUsuarios / pageSize));
  return (
    <div className="p-6">
      <PageHeader
        title="Usuarios"
        description="Administracion de accesos institucionales"
      />
      {message && <InlineMessage>{message}</InlineMessage>}
      <div className="space-y-6">
        <SectionCard
          title={editMode ? "Editar usuario" : "Nuevo usuario"}
          description="Datos de acceso y rol operativo"
        >
          <div className="max-w-5xl space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.1fr)_minmax(220px,1fr)_180px]">
              <label className="block">
                <span className="mb-1.5 block">Nombre</span>
                <input
                  value={editMode ? editMode.nombre : form.nombre}
                  onChange={(e) =>
                    editMode
                      ? setEditMode({ ...editMode, nombre: e.target.value })
                      : setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  placeholder="Nombre completo"
                  className="app-field-input"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block">Correo</span>
                <input
                  value={editMode ? editMode.email : form.email}
                  onChange={(e) =>
                    editMode
                      ? setEditMode({ ...editMode, email: e.target.value })
                      : setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="correo@ueb.edu.ec"
                  className="app-field-input"
                  type="email"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block">Rol</span>
                <select
                  value={editMode ? editMode.rol : form.rol}
                  onChange={(e) =>
                    editMode
                      ? setEditMode({ ...editMode, rol: e.target.value as Rol })
                      : setForm((f) => ({ ...f, rol: e.target.value as Rol }))
                  }
                  className="app-field-input"
                >
                  {Object.entries(rolLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {!editMode && (
                <label className="block md:col-span-2 xl:col-span-1">
                  <span className="mb-1.5 block">Contraseña temporal</span>
                  <input
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    className="app-field-input"
                  />
                </label>
              )}
            </div>
            <div className="app-form-actions flex-col gap-2 sm:flex-row">
              <Button
                onPress={editMode ? actualizar : crear}
                isDisabled={
                  saving ||
                  !(editMode
                    ? editMode.nombre && editMode.email
                    : form.nombre && form.email && form.password.length >= 6)
                }
                className="app-button app-button-primary w-full whitespace-nowrap sm:w-auto"
              >
                {saving ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {editMode ? "Actualizar usuario" : "Crear usuario"}
              </Button>
              {editMode && (
                <Button
                  onPress={() => setEditMode(null)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Usuarios registrados" contentClassName="p-0">
          {loading ? (
            <div className="p-10 text-center">
              <Loader size={20} className="animate-spin mx-auto mb-2" />
              Cargando usuarios
            </div>
          ) : (
            <>
              <AppTable
                columns={usuariosColumns}
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
                    <td className="">{usuario.email}</td>
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onPress={() =>
                            setEditMode({
                              id: usuario.id,
                              nombre: usuario.nombre,
                              email: usuario.email,
                              rol: usuario.rol,
                            })
                          }
                        >
                          Edit.
                        </Button>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className={`h-8 w-8 p-0 flex items-center justify-center ${usuario.activo ? " hover:bg-amber-50" : " hover:bg-green-50"}`}
                            onPress={() => toggleActivo(usuario)}
                            isDisabled={usuario.rol === "admin"}
                            aria-label={
                              usuario.activo ? "Desactivar" : "Activar"
                            }
                          >
                            {usuario.activo ? (
                              <XCircle size={14} />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="app-icon-button-danger"
                            onPress={() => eliminar(usuario)}
                            isDisabled={usuario.rol === "admin"}
                            aria-label="Eliminar"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </AppTable>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
