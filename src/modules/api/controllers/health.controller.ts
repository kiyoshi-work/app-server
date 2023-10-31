import { Goal3Firestore } from '@/modules/firebase';
import { Controller, Get, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('/health')
export class HealthController {
  constructor(
    @Inject('GOAL3_FIRESTORE')
    private goal3Firestore: Goal3Firestore,
  ) {}

  @Get('/firebase')
  async healthCheck() {
    const res = this.goal3Firestore.testConnection();
    return {
      statusCode: HttpStatus.OK,
      data: res,
    };
  }
}
