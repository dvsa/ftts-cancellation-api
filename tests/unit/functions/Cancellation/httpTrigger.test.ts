import { Context, HttpRequest } from '@azure/functions';
import { mock } from 'jest-mock-extended';
import handleError from '../../../../src/error/handleErrorFromHttpTriggers';
import { ValidationError } from '../../../../src/error/validationError';
import { httpTrigger } from '../../../../src/functions/Cancellation/httpTrigger';
import { BusinessTelemetryEvents, logger } from '../../../../src/observability/logger';
import { isInputValid, validateCancellationApiInput } from '../../../../src/validation/validateSchema';
import { CancellationQueueClient } from '../../../../src/queues/cancellation-queue-client';
import { MessageQueueError } from '../../../../src/error/messageQueueError';

jest.mock('../../../../src/validation/validateSchema');
jest.mock('../../../../src/error/handleErrorFromHttpTriggers');
jest.mock('../../../../src/queues/cancellation-queue-client');

jest.mock('../../../../src/config/index', () => ({
  serviceBus: {
    cancellationConnectionString: 'Endpoint=sb://mockurl/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=mockKey=',
    queues: {
      cancellation: {
        name: 'cancellation',
      },
    },
  },
}));

const mockedIsInputValid = jest.mocked(isInputValid, true);
const mockedLogger = jest.mocked(logger, true);
const mockedHandleError = jest.mocked(handleError, true);
const mockedCancellationQueueClient = jest.mocked(CancellationQueueClient, true);

const validData = [{
  bookingProductReference: 'B-002-000-000-02',
},
{
  bookingProductReference: 'B-002-000-000-01',
},
];

const InValidData = [{
  bookingProductReference: 'B-002-000-00-02',
},
{
  bookingProductReference: 'B-002-000-00-01',
},
];

describe('httpTrigger', () => {
  const mockedContext = {} as Context;
  const mockHttpRequest = mock<HttpRequest>();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('When input is given to HTTPTrigger that is valid', async () => {
    mockHttpRequest.body = validData;
    mockedCancellationQueueClient.prototype.sendMessages.mockImplementation(jest.fn());

    await httpTrigger(mockedContext, mockHttpRequest);

    expect(mockedIsInputValid).toHaveBeenCalledWith(validateCancellationApiInput, mockHttpRequest);
    expect(mockedCancellationQueueClient.prototype.sendMessages).toHaveBeenCalledWith(mockHttpRequest.body);
    expect(mockedLogger.event).toHaveBeenCalledWith(
      BusinessTelemetryEvents.CAPI_RECEIVED_SUCCESSFULLY,
      'CancellationApi::isInvalidHTTPRequest: Request schema validation passed',
      {
        response: 200,
        bookingProductReferences: validData,
      },
    );
  });

  test('When input is given to HTTPTrigger that is invalid', async () => {
    mockHttpRequest.body = InValidData;
    const error = new ValidationError('validateSchema::isInputValid:Request schema validation failed');
    mockedIsInputValid.mockImplementationOnce(() => {
      throw error;
    });

    await httpTrigger(mockedContext, mockHttpRequest);

    expect(mockedIsInputValid).toHaveBeenCalledWith(validateCancellationApiInput, mockHttpRequest);
    expect(mockedHandleError).toHaveBeenCalledWith(error, mockedContext);
  });

  test('When sendMessages encounters ann error handleErrors is called', async () => {
    mockHttpRequest.body = validData;
    const error = new MessageQueueError('failed to send message to cancellation queue');
    mockedCancellationQueueClient.prototype.sendMessages.mockRejectedValue(error);

    await httpTrigger(mockedContext, mockHttpRequest);

    expect(mockedHandleError).toHaveBeenCalledWith(error, mockedContext);
  });
});
