export class ServiceError extends Error {
  readonly status: number;
  readonly code: string;
  readonly field?: string;

  constructor(status: number, code: string, message: string, field?: string) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

export class BadRequestError extends ServiceError {
  constructor(message: string, field?: string) {
    super(400, "bad_request", message, field);
  }
}

export class UnauthorizedError extends ServiceError {
  constructor(message = "Sign in to continue") {
    super(401, "unauthorized", message);
  }
}

export class PaymentRequiredError extends ServiceError {
  constructor(message = "Payment is required to continue") {
    super(402, "payment_required", message);
  }
}

export class ForbiddenError extends ServiceError {
  constructor(message = "You do not have access to this") {
    super(403, "forbidden", message);
  }
}

export class NotFoundError extends ServiceError {
  constructor(message = "Not found") {
    super(404, "not_found", message);
  }
}

export class ConflictError extends ServiceError {
  constructor(message: string) {
    super(409, "conflict", message);
  }
}

export class InternalError extends ServiceError {
  constructor(message = "Something went wrong") {
    super(500, "internal", message);
  }
}
