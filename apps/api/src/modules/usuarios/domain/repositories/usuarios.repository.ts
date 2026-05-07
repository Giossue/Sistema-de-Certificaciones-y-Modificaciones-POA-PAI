import { UsuarioEntity } from "../entities/usuario.entity";

export interface UsuariosRepository {
  listar(): Promise<UsuarioEntity[]>;
  obtenerPorId(id: string): Promise<UsuarioEntity | null>;
  crear(data: Omit<UsuarioEntity, "id" | "createdAt" | "updatedAt"> & { password: string }): Promise<UsuarioEntity>;
  actualizar(id: string, data: Partial<Omit<UsuarioEntity, "id" | "createdAt" | "updatedAt">>): Promise<UsuarioEntity>;
  eliminar(id: string): Promise<void>;
}
