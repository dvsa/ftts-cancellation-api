import {
  ServiceBusClient, ServiceBusClientOptions, ServiceBusSender, ServiceBusMessage,
} from '@azure/service-bus';
import config from '../config';
import { BookingProductReference } from '../domain/types';
import { MessageQueueError } from '../error/messageQueueError';
import { BusinessTelemetryEvents, logger } from '../observability/logger';

export class CancellationQueueClient {
  constructor(
    private sender: ServiceBusSender,
  ) { }

  public async sendMessages(messages: BookingProductReference []): Promise<void> {
    try {
      const sbMessages : ServiceBusMessage [] = messages.map(
        (message) => ({
          body: message,
          correlationId: message.bookingProductReference,
          applicationProperties: {
            bookingProductReference: message.bookingProductReference,
          },
        }),
      );
      logger.debug('CancellationQueueClient::sendMessages', { messages: sbMessages });
      await this.sender.sendMessages(sbMessages);
      logger.event(
        BusinessTelemetryEvents.CAPI_MESSAGE_SENT_TO_CANCELLATION_QUEUE,
        'CancellationQueueClient::sendMessages: message sent to cancellation queue successfully',
        {
          bookingProductReferences: messages,
        },
      );
    } catch (error) {
      logger.event(
        BusinessTelemetryEvents.CAPI_SEND_TO_CANCELLATION_QUEUE_ERROR,
        'CancellationQueueClient::sendMessages failed to send message to cancellation queue',
        {
          bookingProductReferences: messages,
        },
      );
      throw new MessageQueueError('CancellationQueueClient::sendMessages: failed to send message to cancellation queue');
    }
  }
}

const clientOptions: ServiceBusClientOptions = {
  customEndpointAddress: config.serviceBus.cancellationConnectionString,
};

const sbClient = new ServiceBusClient(config.serviceBus.cancellationConnectionString, clientOptions);

export default new CancellationQueueClient(sbClient.createSender(config.serviceBus.queues.cancellation.name));
