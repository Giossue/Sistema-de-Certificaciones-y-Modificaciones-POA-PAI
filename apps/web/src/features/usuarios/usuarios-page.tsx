import { useEffect, useState, useMemo } from "react";
import { Button } from "@heroui/react";
import { Loader, Plus, Users, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/services/api-client";
import { Pagination } from "@/components/pagination";

type Rol = "admin" | "director" | "analista" | "unidad";

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
};

const ITEMS_PER_PAGE = 10;

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ nombre: "", email: "", password: "", rol: "unidad" as Rol });
  const [editMode, setEditMode] = useState<{ id: string; nombre: string; email: string; rol: Rol } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await api.get<Usuario[]>("/usuarios");
      setUsuarios(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

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
    if (!confirm(`¿Eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`)) return;
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

  const usuariosPaginados = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return usuarios.slice(start, end);
  }, [usuarios, currentPage]);

  const totalPages = Math.ceil(usuarios.length / ITEMS_PER_PAGE);

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
        <p className="text-sm text-slate-500 mt-1">Administracion de accesos institucionales</p>
      </div>

      {message && <div className="mb-4 bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">{message}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <div className="bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-slate-700">{editMode ? "Editar usuario" : "Nuevo usuario"}</h2>
          </div>
          <div className="space-y-3">
            <input
              value={editMode ? editMode.nombre : form.nombre}
              onChange={(e) => editMode ? setEditMode({ ...editMode, nombre: e.target.value }) : setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Nombre"
              className="w-full px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              value={editMode ? editMode.email : form.email}
              onChange={(e) => editMode ? setEditMode({ ...editMode, email: e.target.value }) : setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Correo institucional"
              className="w-full px-3 py-2 border border-slate-300 text-sm"
              type="email"
            />
            {!editMode && (
              <input
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                type="password"
                placeholder="Contraseña temporal"
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            )}
            <select
              value={editMode ? editMode.rol : form.rol}
              onChange={(e) => editMode ? setEditMode({ ...editMode, rol: e.target.value as Rol }) : setForm((f) => ({ ...f, rol: e.target.value as Rol }))}
              className="w-full px-3 py-2 border border-slate-300 text-sm"
            >
              {Object.entries(rolLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <div className="flex gap-2">
              <Button
                onPress={editMode ? actualizar : crear}
                isDisabled={saving || !(editMode ? editMode.nombre && editMode.email : form.nombre && form.email && form.password.length >= 6)}
                className="flex-1 bg-primary text-white"
              >
                {saving ? <Loader size={16} className="animate-spin" /> : <Users size={16} />}
                {editMode ? "Actualizar" : "Crear usuario"}
              </Button>
              {editMode && (
                <Button
                  onPress={() => setEditMode(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-700">Usuarios registrados</h2>
          </div>
          {loading ? (
            <div className="p-10 text-center text-slate-400"><Loader size={20} className="animate-spin mx-auto mb-2" /> Cargando usuarios</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Correo</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Rol</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosPaginados.map((usuario) => (
                      <tr key={usuario.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{usuario.nombre}</td>
                        <td className="px-4 py-3 text-slate-600">{usuario.email}</td>
                        <td className="px-4 py-3"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 text-xs">{rolLabel[usuario.rol]}</span></td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${usuario.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {usuario.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onPress={() => setEditMode({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol })}
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-8 px-2 ${usuario.activo ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                              onPress={() => toggleActivo(usuario)}
                              isDisabled={usuario.rol === "admin"}
                            >
                              {usuario.activo ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-red-600 hover:bg-red-50"
                              onPress={() => eliminar(usuario)}
                              isDisabled={usuario.rol === "admin"}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={usuarios.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
