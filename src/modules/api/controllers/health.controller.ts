import { AppFirestoreRepository } from '@/modules/firebase';
import { Controller, Get, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { Roles } from '@/shared/decorators/roles.decorator';

@ApiTags('Health')
@Controller('/health')
export class HealthController {
  constructor(
    @Inject('APP_FIRESTORE')
    private appFirestoreRepository: AppFirestoreRepository,
  ) { }

  @ApiBearerAuth()
  @Roles(['OPERATOR', 'ADMIN'])
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
