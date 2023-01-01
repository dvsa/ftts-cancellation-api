import { ServiceBusMessage, ServiceBusSender } from '@azure/service-bus';
import { CancellationQueueClient } from '../../../src/queues/cancellation-queue-client';
import { MessageQueueError } from '../../../src/error/messageQueueError';
import { BusinessTelemetryEvents, logger } from '../../../src/observability/logger';

const bookingRef1 = 'B-002-000-000-01';
const bookingRef2 = 'B-002-000-000-02';

let cancellationQueueClient: CancellationQueueClient;

const mockedLogger = jest.mocked(logger, true);
jest.mock('../../../src/config/index', () => ({
  crm: {
    azureAdUri: 'mockuri',
  },
  serviceBus: {
    cancellationConnectionString: 'Endpoint=sb://mockurl/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=mockKey=',
    queues: {
      cancellation: {
        name: 'cancellation',
      },
    },
  },
}));

describe('Sending messages to cancellation queue', () => {
  const messageInput = [{ bookingProductReference: bookingRef1 }, { bookingProductReference: bookingRef2 }];

  const serviceBusMessages : ServiceBusMessage [] = [
    {
      body: { bookingProductReference: bookingRef1 },
      correlationId: bookingRef1,
      applicationProperties: {
        bookingProductReference: bookingRef1,
      },
    },
    {
      body: { bookingProductReference: bookingRef2 },
      correlationId: bookingRef2,
      applicationProperties: {
        bookingProductReference: bookingRef2,
      },
    },
  ];

  test('Should call ServiceBusSender.sendMessages with messages parameter', async () => {
    const mockSender = {
      sendMessages: jest.fn(),
    };

    cancellationQueueClient = new CancellationQueueClient(mockSender as unknown as ServiceBusSender);

    await cancellationQueueClient.sendMessages(messageInput);

    expect(mockSender.sendMessages).toHaveBeenCalledWith(serviceBusMessages);
    expect(mockedLogger.event).toHaveBeenCalledWith(
      BusinessTelemetryEvents.CAPI_MESSAGE_SENT_TO_CANCELLATION_QUEUE,
      'CancellationQueueClient::sendMessages: message sent to cancellation queue successfully',
      {
        bookingProductReferences: messageInput,
      },
    );
  });

  test('Error scenario', async () => {
    const mockSender = {
      sendMessages: jest.fn().mockRejectedValue(new Error()),
    };

    cancellationQueueClient = new CancellationQueueClient(mockSender as unknown as ServiceBusSender);

    await expect(
      cancellationQueueClient
        .sendMessages(messageInput),
    )
      .rejects
      .toThrow(new MessageQueueError('CancellationQueueClient::sendMessages: failed to send message to cancellation queue'));

    expect(mockedLogger.event).toHaveBeenCalledWith(
      BusinessTelemetryEvents.CAPI_SEND_TO_CANCELLATION_QUEUE_ERROR,
      'CancellationQueueClient::sendMessages failed to send message to cancellation queue',
      {
        bookingProductReferences: messageInput,
      },
    );
  });
});
