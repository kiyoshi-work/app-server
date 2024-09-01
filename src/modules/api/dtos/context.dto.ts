import { Allow } from 'class-validator';

export class ContextAwareDTO {
  @Allow()
  context?: {
    client: any;
  };
}
