import { Context } from "hono";
import { ValidationError } from "../errors/http-error.map";

export type AuthUser = {
  id: string;
  rol: string;
  email?: string;
  nombre?: string;
};

export function userFrom(c: Context): AuthUser {
  return c.get("user") as AuthUser;
}

export function param(c: Context, name: string): string {
  const value = c.req.param(name);
  if (!value) throw new ValidationError(`${name} es requerido`);
  return value;
}
