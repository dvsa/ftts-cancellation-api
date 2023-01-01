import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import handleError from '../../error/handleErrorFromHttpTriggers';
import { BusinessTelemetryEvents, logger } from '../../observability/logger';
import { isInputValid, validateCancellationApiInput } from '../../validation/validateSchema';
import cancellationQueueClient from '../../queues/cancellation-queue-client';
import { BookingProductReference } from '../../domain/types';

export const httpTrigger: AzureFunction = async function cancellationApiTrigger(context: Context, httpRequest: HttpRequest): Promise<void> {
  try {
    logger.debug(`httpTrigger: incoming HttpRequest ${JSON.stringify(httpRequest.body)}`);
    isInputValid(validateCancellationApiInput, httpRequest);

    await cancellationQueueClient.sendMessages(httpRequest.body as BookingProductReference []);

    logger.event(
      BusinessTelemetryEvents.CAPI_RECEIVED_SUCCESSFULLY,
      'CancellationApi::isInvalidHTTPRequest: Request schema validation passed',
      {
        response: 200,
        bookingProductReferences: httpRequest.body,
      },
    );
  } catch (error) {
    handleError(error, context);
  }
};
