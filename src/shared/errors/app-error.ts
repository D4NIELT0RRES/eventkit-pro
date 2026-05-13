import { DomainException, ValidationException } from '../../core/domain/exceptions';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ValidationException) {
    return new AppError('VALIDATION_ERROR', 'Erro de validação', 400, {
      errors: error.errors,
    });
  }

  if (error instanceof DomainException) {
    return new AppError('DOMAIN_ERROR', error.message, 400);
  }

  if (error instanceof Error) {
    return new AppError('INTERNAL_ERROR', error.message, 500);
  }

  return new AppError('UNKNOWN_ERROR', 'Erro desconhecido', 500);
};
