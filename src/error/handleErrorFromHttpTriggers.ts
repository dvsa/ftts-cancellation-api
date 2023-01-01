/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context } from '@azure/functions';
import { logger } from '../observability/logger';
import { ErrorBody, ErrorResponse } from './error';
import { extractMessage } from './errorUtils';
import { ValidationError } from './validationError';

const HEADERS = { 'Content-Type': 'application/json' };

export default function handleError(
  error: any,
  context: Context,
): void {
  (error as Error).message = extractMessage(error);
  logger.log(error as string);
  if (error instanceof ValidationError) {
    createBadRequestResponse(error, context);
  } else {
    createDefaultErrorResponse(error, context);
  }
}

function createBadRequestResponse(error: any, context: Context): void {
  const requestError: ErrorBody = {
    code: 400,
    message: (error as Error).message,
  };
  context.res = createErrorResponse(400, requestError);
}

function createDefaultErrorResponse(error: any, context: Context, message?: string): void {
  const serverError: ErrorBody = {
    code: 500,
    message: message || (error as Error).message,
  };
  context.res = createErrorResponse(500, serverError);
}

function createErrorResponse(statusCode: number, errorBody: ErrorBody): ErrorResponse {
  return {
    status: statusCode,
    headers: HEADERS,
    body: errorBody,
  };
}
