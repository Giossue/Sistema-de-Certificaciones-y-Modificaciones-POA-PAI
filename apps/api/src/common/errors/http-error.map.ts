import { HTTPException } from "hono/http-exception";

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} con id ${id} no encontrado` : `${resource} no encontrado`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Acceso denegado") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export function mapDomainErrorToHttp(error: Error): HTTPException {
  if (error instanceof NotFoundError) {
    return new HTTPException(404, { message: error.message });
  }
  if (error instanceof ValidationError) {
    return new HTTPException(400, { message: error.message });
  }
  if (error instanceof UnauthorizedError) {
    return new HTTPException(401, { message: error.message });
  }
  if (error instanceof ForbiddenError) {
    return new HTTPException(403, { message: error.message });
  }
  if (error instanceof ConflictError) {
    return new HTTPException(409, { message: error.message });
  }
  if (error instanceof DomainError) {
    return new HTTPException(400, { message: error.message });
  }
  return new HTTPException(500, { message: "Error interno del servidor" });
}
