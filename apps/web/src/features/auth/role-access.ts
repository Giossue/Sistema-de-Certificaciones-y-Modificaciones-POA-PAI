export type AppRole =
  | "admin"
  | "director"
  | "analista"
  | "unidad"
  | "financiero"
  | "bienes";

export function hasRole(userRole: string | undefined, allowedRoles: AppRole[]) {
  return Boolean(userRole && allowedRoles.includes(userRole as AppRole));
}

export const moduleRoles = {
  inicio: ["admin", "director", "analista", "unidad", "financiero", "bienes"],
  tramites: ["admin", "director", "analista", "unidad", "financiero", "bienes"],
  poa: ["admin", "director", "analista", "unidad", "financiero", "bienes"],
  cedulaMef: ["admin", "analista"],
  certificaciones: [
    "admin",
    "director",
    "analista",
    "unidad",
    "financiero",
    "bienes",
  ],
  modificacionesPoa: ["admin", "director", "analista", "unidad", "bienes"],
  liquidaciones: ["admin", "director", "unidad"],
  anulaciones: ["admin", "director", "unidad"],
  reportes: ["admin", "director", "analista", "financiero"],
  usuarios: ["admin"],
} satisfies Record<string, AppRole[]>;
