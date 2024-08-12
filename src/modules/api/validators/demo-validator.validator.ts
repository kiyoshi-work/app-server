import { UserRepository } from '@/database/repositories';
import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { VerifyAuthenticatorDTO } from '../dtos/verify-authenticator-secret.dto';

@Injectable()
export class DemoValidatePipe implements PipeTransform<any> {
  @Inject('REQUEST')
  private request: any;

  @Inject(UserRepository)
  private readonly userRepository: UserRepository;

  private validateToken(username: string): boolean {
    return true;
  }

  async transform(data: VerifyAuthenticatorDTO, metadata: ArgumentMetadata) {
    console.log(this.request?.user, 'iiim');
    if (this.validateToken(data.token)) {
      return data;
    } else {
      throw new BadRequestException('Invalid token');
    }
  }
}
