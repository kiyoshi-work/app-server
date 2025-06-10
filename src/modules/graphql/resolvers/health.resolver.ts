import { Query, Resolver } from '@nestjs/graphql';
import { Health } from '../models/health.model';

@Resolver()
export class HealthResolver {
  @Query(() => Health, { name: 'health' })
  checkHealth(): Health {
    return { status: 'OK' };
  }
}
