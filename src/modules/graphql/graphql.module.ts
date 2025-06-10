import { Module } from '@nestjs/common';
import { HealthResolver } from './resolvers/health.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { DatabaseModule } from '@/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtGraphQLGuard } from './guards/jwt-graphql.guard';
import { configAuth } from './configs';
import { GraphQLJSON, GraphQLDateTime } from 'graphql-scalars';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configAuth],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.key.jwt_secret_key'),
        signOptions: {
          expiresIn: configService.get<number>(
            'auth.time.access_token_lifetime',
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    HealthResolver,
    UserResolver,
    JwtGraphQLGuard,
    {
      provide: 'JSON_SCALAR',
      useValue: GraphQLJSON,
    },
    {
      provide: 'DATETIME_SCALAR',
      useValue: GraphQLDateTime,
    },
  ],
})
export class GraphqlModule {}
