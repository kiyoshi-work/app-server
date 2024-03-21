import { AppFirestoreRepository } from '@/modules/firebase';
import { Controller, Get, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('Health')
@Controller('/health')
export class HealthController {
  constructor(
    @Inject('APP_FIRESTORE')
    private appFirestoreRepository: AppFirestoreRepository,
  ) { }

  @UseGuards(AdminGuard)
  @Get('/firebase')
  async healthCheck() {
    const res = await this.appFirestoreRepository.testConnection();
    return {
      statusCode: HttpStatus.OK,
      data: res,
    };
  }
}
