import { describe, expect, test } from "bun:test";
import { getPermissionsForRole } from "./auth.guard";

describe("getPermissionsForRole", () => {
  test("habilita a financiero para devoluciones y reportes sin gestionar usuarios", () => {
    const permisos = getPermissionsForRole("financiero");

    expect(permisos).toContain("devolucion.crear");
    expect(permisos).toContain("devolucion.ver");
    expect(permisos).toContain("devolucion.clasificar");
    expect(permisos).toContain("certificacion.marcar_uso");
    expect(permisos).toContain("reporte.ver");
    expect(permisos).not.toContain("usuarios.gestionar");
  });

  test("habilita a bienes para consultar POA y crear modificaciones sin aprobarlas", () => {
    const permisos = getPermissionsForRole("bienes");

    expect(permisos).toContain("poa.ver");
    expect(permisos).toContain("poa.actividad.ver");
    expect(permisos).toContain("modificacion.crear");
    expect(permisos).not.toContain("modificacion.aprobar");
  });

  test("habilita aprobaciones institucionales sin abrir gestion de usuarios", () => {
    const director = getPermissionsForRole("director");
    const analista = getPermissionsForRole("analista");

    expect(director).toContain("liquidacion.aprobar");
    expect(director).toContain("anulacion.aprobar");
    expect(analista).toContain("liquidacion.aprobar");
    expect(analista).toContain("devolucion.clasificar");
    expect(analista).not.toContain("usuarios.gestionar");
  });
});
