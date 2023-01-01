import Ajv from 'ajv';
import { HttpRequest } from '@azure/functions';
import { BusinessTelemetryEvents, logger } from '../observability/logger';
import cancellationApiSchema from '../cancellationApi-schema.json';
import { ValidationError } from '../error/validationError';

const ajv = new Ajv({ allErrors: true });
export const validateCancellationApiInput = ajv.compile(cancellationApiSchema);

export type DefaultValidationError = {
  dataPath: string;
  errorMessage: string;
  params: Record<string, string | number>;
};

export default function validateSchema(validateFunction: Ajv.ValidateFunction, data: Record<string, unknown>): boolean | PromiseLike<any> {
  const validated = ajv.validate(cancellationApiSchema, data);

  if (!validated) {
    logger.debug('validateSchema: Schema validation failed', {
      data,
      Errors: ajv.errorsText(),
    });
  }

  return validated;
}

export function isInputValid(validateFunction: Ajv.ValidateFunction, httpRequestInput: HttpRequest) {
  const validation = validateSchema(validateFunction, httpRequestInput.body as unknown as Record<string, unknown>);
  if (!validation) {
    logger.event(
      BusinessTelemetryEvents.CAPI_HTTP_VALIDATION_ERROR,
      'CancellationApi::isInvalidHTTPRequest: Request schema validation failed',
      {
        response: 400,
        Error: ajv.errorsText(),
        bookingProductReferences: httpRequestInput.body,
      },
    );
    throw new ValidationError(`Validation Error - ${ajv.errorsText()}`);
  }
  logger.info('validateSchema::isInputValid:Request schema validation passed');
  return true;
}
