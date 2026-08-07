import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  description = 'Paginated results',
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              nextCursor: {
                type: 'string',
                nullable: true,
                description:
                  'Cursor to pass for the next page, or null if this is the last page',
              },
            },
          },
        ],
      },
    }),
  );
};
