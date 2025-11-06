/**
 * Standardized HTTP error helpers
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function badRequest(message: string, details?: any): AppError {
  return new AppError(400, 'BAD_REQUEST', message, details);
}

export function unauthorized(message: string = 'Unauthorized'): AppError {
  return new AppError(401, 'UNAUTHORIZED', message);
}

export function forbidden(message: string = 'Forbidden'): AppError {
  return new AppError(403, 'FORBIDDEN', message);
}

export function notFound(message: string = 'Resource not found'): AppError {
  return new AppError(404, 'NOT_FOUND', message);
}

export function conflict(message: string, details?: any): AppError {
  return new AppError(409, 'CONFLICT', message, details);
}

export function unprocessableEntity(message: string, details?: any): AppError {
  return new AppError(422, 'UNPROCESSABLE_ENTITY', message, details);
}

export function internalError(message: string = 'Internal server error', details?: any): AppError {
  return new AppError(500, 'INTERNAL_ERROR', message, details);
}

export function errorHandler(error: unknown): { statusCode: number; body: any } {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
    };
  }
  
  // Unknown error
  console.error('Unhandled error:', error);
  return {
    statusCode: 500,
    body: {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
  };
}

