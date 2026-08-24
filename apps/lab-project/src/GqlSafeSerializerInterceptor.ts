import { ExecutionContext, Injectable } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlSafeSerializerInterceptor extends ClassSerializerInterceptor {
  serialize(response: any, options: any) {
    if (response && typeof response[Symbol.asyncIterator] === 'function') {
      return response;
    }
    return super.serialize(response, options);
  }
}
