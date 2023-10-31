export class RateLimitExternalIdsException extends Error {
  constructor(message = 'Maximum 1000 id') {
    super();
    this.message = message;
  }
}
