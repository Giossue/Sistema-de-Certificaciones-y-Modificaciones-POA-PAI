export interface UsuarioEntity {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
