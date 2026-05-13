export interface Success<T> {
  ok: true;
  data: T;
}

export interface Failure {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export type Result<T> = Success<T> | Failure;

export const success = <T>(data: T): Success<T> => ({
  ok: true,
  data,
});

export const failure = (
  code: string,
  message: string,
  details?: Record<string, any>
): Failure => ({
  ok: false,
  error: {
    code,
    message,
    details,
  },
});

export const isSuccess = <T>(result: Result<T>): result is Success<T> => result.ok === true;

export const isFailure = <T>(result: Result<T>): result is Failure => result.ok === false;
