export default {

  /**
    * CRM
    */
  crm: {
    azureAdUri: process.env.CRM_AZURE_AD_URI || '',
    azureClientId: process.env.CRM_AZURE_CLIENT_ID || '',
    azureClientSecret: process.env.CRM_AZURE_CLIENT_SECRET || '',
    scope: process.env.CRM_SCOPE || '',
  },

  /**
    * Azure
    */
  serviceBus: {
    cancellationConnectionString: process.env.SERVICE_BUS_CONNECTION_STRING || '',
    queues: {
      cancellation: {
        name: process.env.CANCELLATION_API_QUEUE_CANCELLATION_NAME || '',
      },
    },
  },
};
