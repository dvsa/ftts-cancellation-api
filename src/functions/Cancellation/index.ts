import { Context, HttpRequest } from '@azure/functions';
import { httpTriggerContextWrapper } from '@dvsa/azure-logger';
import { withEgressFiltering } from '@dvsa/egress-filtering';
import { ALLOWED_ADDRESSES, ON_INTERNAL_ACCESS_DENIED_ERROR } from '../../security/egress';
import { logger } from '../../observability/logger';
import { httpTrigger } from './httpTrigger';

export const index = async (context: Context, httpRequest: HttpRequest): Promise<void> => httpTriggerContextWrapper(
  withEgressFiltering(
    httpTrigger,
    ALLOWED_ADDRESSES(),
    ON_INTERNAL_ACCESS_DENIED_ERROR,
    logger,
  ),
  context,
  httpRequest,
);
