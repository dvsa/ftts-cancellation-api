import { HttpRequest } from '@azure/functions';
import { mock } from 'jest-mock-extended';
import Ajv from 'ajv';
import validateSchema, { isInputValid } from '../../../src/validation/validateSchema';
import testSchema from '../../mocks/test.schema.json';
import { BusinessTelemetryEvents, logger } from '../../../src/observability/logger';
import { ValidationError } from '../../../src/error/validationError';

const ajv = new Ajv({ allErrors: true });
const testValidateFunction = ajv.compile(testSchema);
const mockedLogger = jest.mocked(logger, true);

const validData = [{
  bookingProductReference: 'B-002-000-000-02',
},
{
  bookingProductReference: 'B-002-000-000-01',
},
];

const dataWithIncorrectLength = [{
  bookingProductReference: 'B-002-000-000-0',
},
{
  bookingProductReference: 'B-002-000-000-01',
},
];

describe('validateSchema Tests', () => {
  describe('validateSchema', () => {
    test('GIVEN valid input data WHEN validateSchema THEN returns true', () => {
      expect(validateSchema(testValidateFunction, validData as unknown as Record<string, unknown>)).toBe(true);
    });

    test('GIVEN input data without required field WHEN validateSchema THEN returns false', () => {
      const validation = validateSchema(testValidateFunction, [{}] as unknown as Record<string, unknown>);

      expect(validation).toBe(false);
      expect(mockedLogger.debug).toHaveBeenCalledWith('validateSchema: Schema validation failed', {
        data: [{}],
        Errors: "data[0] should have required property 'bookingProductReference'",
      });
    });

    test('GIVEN input data with additional property WHEN validateSchema THEN returns false', () => {
      const validation = validateSchema(testValidateFunction, [{
        bookingProductReference: 'B-002-000-000-01',
        additionalProperty: 'ha!',
      }] as unknown as Record<string, unknown>);

      expect(validation).toBe(false);
      expect(mockedLogger.debug).toHaveBeenCalledWith('validateSchema: Schema validation failed', {
        data: [{
          additionalProperty: 'ha!',
          bookingProductReference: 'B-002-000-000-01',
        }],
        Errors: 'data[0] should NOT have additional properties',
      });
    });

    test('GIVEN input data with wrong value WHEN validateSchema THEN returns false', () => {
      expect(validateSchema(testValidateFunction, dataWithIncorrectLength as unknown as Record<string, unknown>)).toBe(false);
    });
  });

  describe('isInputValid', () => {
    const mockHttpRequest = mock<HttpRequest>();

    test('when httpRequest contains valid Booking reference return true', () => {
      mockHttpRequest.body = validData;

      const isInputValidValue = isInputValid(testValidateFunction, mockHttpRequest);

      expect(isInputValidValue).toBe(true);
      expect(mockedLogger.info).toHaveBeenCalledWith('validateSchema::isInputValid:Request schema validation passed');
    });

    test('when httpRequest contains Invalid Booking reference return ValidationError', () => {
      mockHttpRequest.body = dataWithIncorrectLength;

      expect(() => isInputValid(testValidateFunction, mockHttpRequest)).toThrow(new ValidationError('Validation Error - data[0].bookingProductReference should NOT be shorter than 16 characters'));
      expect(mockedLogger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.CAPI_HTTP_VALIDATION_ERROR,
        'CancellationApi::isInvalidHTTPRequest: Request schema validation failed',
        {
          response: 400,
          Error: 'data[0].bookingProductReference should NOT be shorter than 16 characters',
          bookingProductReferences: dataWithIncorrectLength,
        },
      );
    });
  });
});
