export type AppRole = "admin" | "director" | "analista" | "unidad";

export function hasRole(userRole: string | undefined, allowedRoles: AppRole[]) {
  return Boolean(userRole && allowedRoles.includes(userRole as AppRole));
}

export const moduleRoles = {
  inicio: ["admin", "director", "analista", "unidad"],
  poa: ["admin", "director", "analista", "unidad"],
  cedulaMef: ["admin", "analista"],
  certificaciones: ["admin", "director", "analista", "unidad"],
  modificacionesPoa: ["admin", "director", "analista", "unidad"],
  liquidaciones: ["admin", "director", "unidad"],
  anulaciones: ["admin", "director", "unidad"],
  reportes: ["admin", "director", "analista"],
  usuarios: ["admin"],
} satisfies Record<string, AppRole[]>;
