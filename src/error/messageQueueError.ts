/* eslint-disable @typescript-eslint/no-explicit-any */
export class MessageQueueError extends Error {
  constructor(
    message?: string,
    public properties?: { [key: string]: any },
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = MessageQueueError.name;
  }
}
