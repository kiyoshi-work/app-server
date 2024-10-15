import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  validate,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ContextAwareDTO } from './context.dto';
import { UserRepository } from '@/modules/database/repositories';
import { Injectable } from '@nestjs/common';

export class FacebookQuestLike {
  @IsString()
  post_id: string;

  @IsString()
  url: string;
}

export class FacebookQuestFollow {
  @IsString()
  page_id: string;

  @IsString()
  url: string;
}

export class FacebookQuestComment {
  @IsString()
  post_id: string;

  @IsString()
  url: string;
}

export class TiktokQuestLike {
  @IsString()
  post_id: string;

  @IsString()
  url: string;
}

export class TiktokQuestFollow {
  @IsString()
  page_id: string;

  @IsString()
  url: string;
}

export class TiktokQuestComment {
  @IsString()
  post_id: string;

  @IsString()
  url: string;
}

export class TiktokQuestView {
  @IsString()
  post_id: string;

  @IsString()
  url: string;
}

export class TwitterQuestLike {
  @IsString()
  post_id: string;

  @IsString()
  url: string;
}

export class TwitterQuestFollow {
  @IsString()
  page_id: string;

  @IsString()
  url: string;
}

export class YoutubeQuestFollow {
  @IsString()
  channel_id: string;

  @IsString()
  url: string;
}

export class YoutubeQuestView {
  @IsString()
  video_id: string;

  @IsString()
  url: string;
}

export class YoutubeQuestLike {
  @IsString()
  video_id: string;

  @IsString()
  url: string;
}

export enum Platform {
  Tiktok = 'tiktok',
  Facebook = 'facebook',
  Youtube = 'youtube',
  Twitter = 'twitter',
}

export enum QuestType {
  Likes = 'likes',
  Comments = 'comments',
  Shares = 'shares',
  Views = 'views',
  Follows = 'follows',
  Join = 'join',
}

@ValidatorConstraint({
  name: 'ValidateQuestContent',
})
@Injectable()
export class ValidateQuestContent implements ValidatorConstraintInterface {
  /**
   * Validates the quest content based on the specified platform and quest type.
   * This function determines the appropriate class for validation using the platform and type
   * provided in the validation arguments, creates an instance of that class with the given value,
   * and checks for validation errors. If the platform/type combination is unsupported or if
   * validation fails, it throws an error; otherwise, it returns true indicating successful validation.
   */
  async validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    let _cls: any;
    switch (validationArguments.object['platform'] as Platform) {
      case Platform.Facebook:
        switch (validationArguments.object['type']) {
          case QuestType.Likes:
            _cls = FacebookQuestLike;
            break;
          case QuestType.Follows:
            _cls = FacebookQuestFollow;
            break;
          case QuestType.Comments:
            _cls = FacebookQuestComment;
            break;
          case QuestType.Views:
          default:
            break;
        }
        break;
      case Platform.Twitter:
        switch (validationArguments.object['type']) {
          case QuestType.Likes:
            _cls = TwitterQuestLike;
            break;
          case QuestType.Follows:
            _cls = TwitterQuestFollow;
            break;
          case QuestType.Comments:
          case QuestType.Views:
          default:
            break;
        }
        break;
      case Platform.Tiktok:
        switch (validationArguments.object['type']) {
          case QuestType.Likes:
            _cls = TiktokQuestLike;
            break;
          case QuestType.Follows:
            _cls = TiktokQuestFollow;
            break;
          case QuestType.Comments:
            _cls = TiktokQuestComment;
            break;
          case QuestType.Views:
            _cls = TiktokQuestView;
            break;
          default:
            break;
        }
        break;
      case Platform.Youtube:
        switch (validationArguments.object['type']) {
          case QuestType.Likes:
            _cls = YoutubeQuestLike;
            break;
          case QuestType.Follows:
            _cls = YoutubeQuestFollow;
            break;
          case QuestType.Comments:
            _cls = FacebookQuestComment;
            break;
          case QuestType.Views:
            _cls = YoutubeQuestView;
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
    if (!_cls) {
      throw new Error(
        `Platform ${validationArguments.object['platform']} not supported type ${validationArguments.object['type']}!`,
      );
    } else {
      const questContent = plainToInstance(_cls, value);
      const errors = await validate(questContent);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors}`);
      }
    }
    return true;
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    return 'Quest content not valid';
  }
}

@ValidatorConstraint({
  name: 'ValidateCodeUppercase',
  async: true,
})
@Injectable()
export class ValidateCodeUppercase implements ValidatorConstraintInterface {
  constructor(private readonly userRepository: UserRepository) {}
  async validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {},
    });
    console.log('🚀 ~ ValidateCodeUppercase ~ user:', user);
    return value === value.toUpperCase();
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    throw new Error('Code is not UPPERCASE');
  }
}

export class CreateQuestDto {
  @ApiProperty({
    required: true,
  })
  @IsObject()
  // NOTE: Validate will be executed before decorator property below like @IsEnum ???
  @Validate(ValidateQuestContent)
  quest_content: any;

  @ApiProperty({
    required: true,
  })
  @IsEnum(Platform)
  platform: Platform;

  @ApiProperty({
    required: true,
  })
  @IsEnum(QuestType)
  type: QuestType;

  @ApiPropertyOptional()
  @IsOptional()
  @Validate(ValidateCodeUppercase, { each: true })
  @IsString({ each: true })
  @ArrayNotEmpty({ message: 'code_uppercase array should not be empty' })
  @IsArray()
  code_uppercase: string[];
}

export class DemoDTO extends ContextAwareDTO {
  @ApiProperty({
    required: true,
    example: '2020-01-01',
  })
  @IsDateString()
  start_date: Date;

  @ApiProperty({
    required: true,
    type: [CreateQuestDto],
    example: [
      {
        quest_content: {
          post_id: '1234567890',
          url: 'https://facebook.com/example-post',
        },
        platform: Platform.Facebook,
        type: QuestType.Likes,
      },
    ],
  })
  // @Validate(ValidateCampaignQuest)
  // TIP: use ValidateNested + Type to validate nested array, execute from down->up
  @ValidateNested({ each: true })
  @Type(() => CreateQuestDto)
  @ArrayNotEmpty()
  @IsArray()
  quest: CreateQuestDto[];
}
