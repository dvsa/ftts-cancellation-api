import { Address, InternalAccessDeniedError } from '@dvsa/egress-filtering';
import { BusinessTelemetryEvents, logger } from '../../../src/observability/logger';
import { ALLOWED_ADDRESSES, ON_INTERNAL_ACCESS_DENIED_ERROR } from '../../../src/security/egress';
import config from '../../../src/config/index';

jest.mock('../../../src/config/index');

const mockedConfig = jest.mocked(config, true);
const mockedLogger = jest.mocked(logger, true);

describe('egress', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ALLOWED_ADDRESSES', () => {
    test.each([
      [
        (): void => {
          mockedConfig.crm.azureAdUri = 'https://test-crm.com:443';
        },
        {
          host: 'test-crm.com',
          port: 443,
        },
      ],
    ])('contain all required addresses as per the config', (givenConfig: () => void, expectedAddresses: Address) => {
      givenConfig();
      expect(ALLOWED_ADDRESSES()[0]).toEqual(expectedAddresses);
    });
  });

  describe('ON_INTERNAL_ACCESS_DENIED_ERROR', () => {
    test('proper event is logged', () => {
      const error = new InternalAccessDeniedError('localhost', '80', 'Unrecognised address');

      ON_INTERNAL_ACCESS_DENIED_ERROR(error);
      expect(mockedLogger.log).toHaveBeenCalledWith(
        BusinessTelemetryEvents.NOT_WHITELISTED_URL_CALL,
        {
          error: error.message,
          host: error.host,
          port: error.port,
        },
      );
    });
  });
});
