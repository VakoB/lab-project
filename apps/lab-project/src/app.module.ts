import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { ConversationModule } from './conversation/conversation.module';
import { OrganizationModule } from './organization/organization.module';
import { SessionModule } from './session/session.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { FilesModule } from './files/files.module';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { GqlSafeSerializerInterceptor } from './GqlSafeSerializerInterceptor';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      formatError: (error) => {
        console.error('GraphQL Execution Error:', error);
        return {
          message: error.message || 'Internal server error',
          path: error.path,
          extensions: error.extensions,
        };
      },
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: any) => {
            const { connectionParams, extra } = context;

            const authToken =
              connectionParams?.authorization ||
              connectionParams?.Authorization;

            if (!authToken) {
              throw new Error('Missing auth token in connectionParams');
            }

            extra.token = authToken.replace('Bearer ', '');
          },
        },
      },
      context: ({ req, extra }: any) => {
        if (extra) {
          return {
            req: {
              headers: {
                authorization: `Bearer ${extra.token}`,
              },
            },
          };
        }
        return { req };
      },
    }),
    UserModule,
    MessageModule,
    ConversationModule,
    OrganizationModule,
    SessionModule,
    AuthModule,
    FilesModule,
    RagModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: GqlSafeSerializerInterceptor },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
