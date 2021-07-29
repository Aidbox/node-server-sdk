export class AidboxError extends Error {}

export class NotFoundError extends AidboxError {
  type = "NotFoundError";
  constructor(entity: string, public data?: Record<string, any>) {
    super(`${entity} not found`);
    this.data = data;
  }
}

export class ValidationError extends AidboxError {
  type = "ValidatorError";
}
