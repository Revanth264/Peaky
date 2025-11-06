/**
 * Request validators using Zod
 */

import { z } from 'zod';
import { badRequest, unprocessableEntity } from './utils/errors.js';
import { HandleSchema, CreateOrderRequestSchema, ReviewSchema } from './utils/schema.js';

/**
 * Validate and parse request body
 */
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw unprocessableEntity('Validation failed', {
        errors: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    throw badRequest('Invalid request body');
  }
}

/**
 * Validate handle
 */
export function validateHandle(handle: string): string {
  try {
    return HandleSchema.parse(handle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw unprocessableEntity(error.errors[0]?.message || 'Invalid handle');
    }
    throw badRequest('Invalid handle');
  }
}

/**
 * Validate create order request
 */
export const validateCreateOrderRequest = (data: unknown) =>
  validateBody(CreateOrderRequestSchema, data);

/**
 * Validate review submission
 */
export const validateReviewSubmission = (data: unknown) =>
  validateBody(ReviewSchema, data);

