const UNKNOWN_ERROR_MESSAGE = 'No additional error details';

export function extractMessage(error: any): string {
  if ((error as Error).message) return (error as Error).message;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (error.error) return extractMessage(error.error);
  if (error instanceof Array) {
    return extractMessage(error[0]);
  }
  return UNKNOWN_ERROR_MESSAGE;
}
