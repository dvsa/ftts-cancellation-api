import { Address, addressParser, InternalAccessDeniedError } from '@dvsa/egress-filtering';
import config from '../config';
import { BusinessTelemetryEvents, logger } from '../observability/logger';

export const ALLOWED_ADDRESSES = (): Array<Address> => [
  // only as example of code
  addressParser.parseUri(config.crm.azureAdUri),
  addressParser.parseSbConnectionString(config.serviceBus.cancellationConnectionString),
];

export const ON_INTERNAL_ACCESS_DENIED_ERROR = (error: InternalAccessDeniedError): void => {
  logger.log(
    BusinessTelemetryEvents.NOT_WHITELISTED_URL_CALL,
    {
      error: error.message,
      host: error.host,
      port: error.port,
    },
  );
};
