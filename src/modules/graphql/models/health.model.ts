import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Health {
  @Field()
  status: string;
}
