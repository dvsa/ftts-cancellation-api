import { Context, HttpRequest } from '@azure/functions';
import { httpTriggerContextWrapper } from '@dvsa/azure-logger';
import { Address, withEgressFiltering } from '@dvsa/egress-filtering';
import { mock } from 'jest-mock-extended';
import { index as wrapped } from '../../../../src/functions/Cancellation/index';
import { httpTrigger } from '../../../../src/functions/Cancellation/httpTrigger';
import { ALLOWED_ADDRESSES, ON_INTERNAL_ACCESS_DENIED_ERROR } from '../../../../src/security/egress';
import { logger } from '../../../../src/observability/logger';

jest.mock('@dvsa/egress-filtering');
jest.mock('../../../../src/security/egress');
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

const mockedLogger = jest.mocked(logger, true);

describe('httpTrigger wrapped by httpTriggerContextWrapper', () => {
  const mockedContext = {} as Context;
  const mockHttpRequest = mock<HttpRequest>();

  test('GIVEN azure function WHEN invoke wrapper THEN wrapped function is invoked', async () => {
    const mockedWithEgressFiltering = jest.mocked(withEgressFiltering, true);
    const mockedFunction = jest.fn();
    mockedWithEgressFiltering.mockReturnValue(mockedFunction);
    const mockedHTTPTrigger = jest.mocked(httpTrigger, true);
    const mockedAllowedAddresses = jest.mocked(ALLOWED_ADDRESSES, true);
    const mockedAddresses = mock<Address[]>();
    mockedAllowedAddresses.mockReturnValue(mockedAddresses);
    const mockedOnInternalAccessDeniederror = jest.mocked(ON_INTERNAL_ACCESS_DENIED_ERROR, true);

    await wrapped(mockedContext, mockHttpRequest);

    expect(withEgressFiltering).toHaveBeenCalledWith(mockedHTTPTrigger, mockedAddresses, mockedOnInternalAccessDeniederror, mockedLogger);
    expect(httpTriggerContextWrapper).toHaveBeenCalledWith(mockedFunction, mockedContext, mockHttpRequest);
  });
});
