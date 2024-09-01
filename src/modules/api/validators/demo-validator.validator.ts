import { UserRepository } from '@/database/repositories';
import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { DemoDTO } from '../dtos/demo-validator.dto';

@Injectable()
export class DemoValidatePipe implements PipeTransform<any> {
  @Inject('REQUEST')
  private request: any;

  @Inject(UserRepository)
  private readonly userRepository: UserRepository;

  private validateToken(username: string): boolean {
    return true;
  }

  async transform(data: DemoDTO, metadata: ArgumentMetadata) {
    console.log(this.request, 'iiim');
    if (this.validateToken(data.start_date.toString())) {
      return data;
    } else {
      throw new BadRequestException('Invalid token');
    }
  }
}
