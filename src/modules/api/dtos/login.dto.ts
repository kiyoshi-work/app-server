import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TwitterOauthDto {
  // @ApiProperty({ required: true, description: 'oauth_token' })
  // @IsString()
  // oauth_token: string;

  // @ApiProperty({ required: true, description: 'oauth_verifier' })
  // @IsString()
  // oauth_verifier: string;

  @ApiProperty({ required: true, description: 'code' })
  @IsString()
  code: string;
}
