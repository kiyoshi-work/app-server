import {
  RpcHandler,
  RpcPayload,
  RpcVersion,
  RpcId,
  RpcMethod,
  RpcMethodHandler,
} from '@/shared/libs/json-rpc';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtJRPCAuthGuard } from '../guards/jwt-auth-jrpc.guard';
import { ForbiddenException } from '@/shared/exceptions';

@RpcHandler({ method: 'health' })
export class HealthHandler {
  constructor(private jwt: JwtService) {}

  @RpcMethodHandler('check')
  public async check(
    @RpcPayload() payload: any,
    @RpcVersion() version: string,
    @RpcId() id: number | string,
    @RpcMethod() method: string,
  ) {
    // try {
    //   const response = await fetch('https://example.com/');
    //   const resp = await response.json();
    //   console.log(resp);
    // } catch (error) {
    //   // throw error.message;
    //   throw ForbiddenException.FORBIDDEN(error.message);
    // }
    return 1;
  }

  @RpcMethodHandler('guard')
  @UseGuards(JwtJRPCAuthGuard)
  public async guard(
    @RpcPayload() payload: any,
    @RpcVersion() version: string,
    @RpcId() id: number | string,
    @RpcMethod() method: string,
  ) {
    return payload;
  }

  @RpcMethodHandler('signin')
  public signin(
    @RpcPayload() payload: any,
    @RpcVersion() version: string,
    @RpcId() id: number | string,
    @RpcMethod() method: string,
  ) {
    const user = { id: '', name: '' };
    if (user === undefined) {
      throw new NotFoundException('User not found');
    }
    return {
      user: {
        id: user.id,
        name: user.name,
      },
      token: this.jwt.sign({ id: user.id }),
    };
  }
}
