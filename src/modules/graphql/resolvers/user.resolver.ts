import { Args, ID, Query, Resolver, Mutation } from '@nestjs/graphql';
import { UserRepository } from '@/modules/database/repositories';
import { UserModel } from '@/modules/graphql/models/user.model';
import { UseGuards } from '@nestjs/common';
import { JwtGraphQLGuard } from '../guards/jwt-graphql.guard';
import { GqlCurrentUser } from '../decorators/current-user.decorator';
import { TJWTPayload } from '@/shared/types';

@Resolver(() => UserModel)
export class UserResolver {
  constructor(private readonly userRepository: UserRepository) {}

  // Query to get all users (protected)
  @Query(() => [UserModel], { description: 'Get all users' })
  @UseGuards(JwtGraphQLGuard)
  async users(@GqlCurrentUser() user: TJWTPayload) {
    console.log('Current user:', user);
    return this.userRepository.find();
  }

  // Query to get a single user by ID (protected)
  @Query(() => UserModel, { nullable: true, description: 'Get a user by ID' })
  @UseGuards(JwtGraphQLGuard)
  async user(
    @Args('id', { type: () => ID }) id: string,
    @GqlCurrentUser() currentUser: TJWTPayload,
  ): Promise<UserModel> {
    console.log('Current user:', currentUser);
    const user = await this.userRepository.findOne({ where: { id } });
    return {
      id: user.id,
      metadata: user.metadata,
      created_at: user.created_at,
    };
  }

  // Mutation to create a user (protected)
  @Mutation(() => UserModel, { description: 'Create a new user' })
  @UseGuards(JwtGraphQLGuard)
  async createUser(
    @GqlCurrentUser() currentUser: TJWTPayload,
    @Args('client_id', { nullable: true }) client_id?: string,
    @Args('client_uid', { nullable: true }) client_uid?: string,
  ): Promise<UserModel> {
    console.log('Current user:', currentUser);
    const createUserDto = {
      client_id,
      client_uid,
    };
    return this.userRepository.save(createUserDto);
  }

  // Mutation to delete a user (protected)
  @Mutation(() => UserModel, { description: 'Delete a user' })
  @UseGuards(JwtGraphQLGuard)
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
    @GqlCurrentUser() currentUser: TJWTPayload,
  ): Promise<UserModel> {
    console.log('Current user:', currentUser);
    const user = await this.userRepository.findOne({ where: { id } });
    await this.userRepository.delete(user);
    return {
      id: user.id,
      username: user.username,
      metadata: user.metadata,
      created_at: user.created_at,
    };
  }
}
