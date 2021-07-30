import { AxiosError } from "axios";
import R from "ramda";

export abstract class AidboxError extends Error {
  type?: string;
  data?: Record<string, any>;
}

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

export const isAidboxError = (err: Error): err is AidboxError => {
  return err instanceof AidboxError;
};

export const isAxiosError = (err: Error): err is AxiosError => {
  return (err as AxiosError).isAxiosError;
};

export type TParsedError = {
  status: number;
  error: {
    message: string;
    type?: string;
    data?: Record<string, any>;
  };
};

export const parseError = (err: Error): TParsedError => {
  if (isAidboxError(err)) {
    return {
      status: 422,
      error: R.pick(["type", "message", "data"], err),
    };
  }
  if (isAxiosError(err)) {
    return {
      status: err.response?.status || 500,
      error: {
        type: "AxiosError",
        message: err.message,
        data: err.response?.data,
      },
    };
  }
  return {
    status: 500,
    error: {
      type: err.constructor.name,
      message: err.message,
    },
  };
};
