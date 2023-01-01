import { ErrorResponse } from '../../../src/error/error';
import handleError from '../../../src/error/handleErrorFromHttpTriggers';
import { ValidationError } from '../../../src/error/validationError';
import { logger } from '../../../src/observability/logger';
import { context } from '../../mocks/context.mock';

const mockedLogger = jest.mocked(logger, true);

describe('handleError', () => {
  const ERROR_MSG = 'error';
  const UNKNOWN_ERROR_MESSAGE = 'No additional error details';
  let error: any;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validation errors', () => {
    test('GIVEN error WHEN error type HttpRequestValidationError THEN bad request response', () => {
      error = new ValidationError(ERROR_MSG);
      const expectedResponse = createErrorResponse(400, ERROR_MSG);

      handleError(error, context);

      expect(context.res).toEqual(expectedResponse);
      expect(mockedLogger.log).toHaveBeenCalledWith(
        error,
      );
    });
  });

  describe('unknown errors', () => {
    test('GIVEN unknown error WHEN no message THEN proper 500 response', () => {
      error = {};
      const expectedResponse = createErrorResponse(500, UNKNOWN_ERROR_MESSAGE);

      handleError(error, context);

      expect(context.res).toEqual(expectedResponse);
      assertLogError(error);
    });
    test('GVEN unknown error WEN message THEN proper 500 response', () => {
      const CUSTOME_ERROR_MESSAGE = 'Beware of errors!';
      error = { message: CUSTOME_ERROR_MESSAGE };
      const expectedResponse = createErrorResponse(500, CUSTOME_ERROR_MESSAGE);

      handleError(error, context);

      expect(context.res).toEqual(expectedResponse);
      assertLogError(error);
    });
  });
});

function createErrorResponse(httpStatusCode: number, errorMessage: string): ErrorResponse {
  return {
    status: httpStatusCode,
    headers: { 'Content-Type': 'application/json' },
    body: {
      code: httpStatusCode,
      message: errorMessage,
    },
  };
}

function assertLogError(error: any): void {
  expect(mockedLogger.log).toHaveBeenCalledWith(
    error,
  );
}
