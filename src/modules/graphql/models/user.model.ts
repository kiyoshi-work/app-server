import { TUserMetadata } from '@/modules/database/entities/user.entity';
import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType({ description: 'User object' })
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field({ description: "User's username", nullable: true })
  username?: string;

  @Field({ description: "User's client id", nullable: true })
  client_id?: string;

  @Field({ description: "User's client uid", nullable: true })
  client_uid?: string;

  @Field(() => GraphQLJSON, { description: "User's metadata", nullable: true })
  metadata?: TUserMetadata;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'When the user was created',
  })
  created_at?: Date;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'When the user was last updated',
  })
  updated_at?: Date;
}
