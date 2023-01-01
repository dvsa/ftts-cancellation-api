import { Logger } from '@dvsa/azure-logger';
import { CustomAxiosError } from '@dvsa/azure-logger/dist/interfaces';

const logger = new Logger('FTTS', process.env.WEBSITE_SITE_NAME || 'ftts-cancellation-api');

enum BusinessTelemetryEvents {
  NOT_WHITELISTED_URL_CALL = 'NOT_WHITELISTED_URL_CALL',
  CAPI_HTTP_VALIDATION_ERROR = 'CAPI_HTTP_VALIDATION_ERROR',
  CAPI_RECEIVED_SUCCESSFULLY = 'CAPI_RECEIVED_SUCCESSFULLY',
  CAPI_MESSAGE_SENT_TO_CANCELLATION_QUEUE = 'CAPI_MESSAGE_SENT_TO_CANCELLATION_QUEUE',
  CAPI_SEND_TO_CANCELLATION_QUEUE_ERROR = 'CAPI_SEND_TO_CANCELLATION_QUEUE_ERROR',
}

export {
  logger,
  CustomAxiosError,
  BusinessTelemetryEvents,
};
