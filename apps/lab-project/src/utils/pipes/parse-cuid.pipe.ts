import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseCuidPipe implements PipeTransform<
  string | undefined,
  string | undefined
> {
  private readonly cuidRegex = /^c[a-z0-9]{24}$/;

  transform(value: string | undefined): string | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (!this.cuidRegex.test(value)) {
      throw new BadRequestException(
        'Validation failed (a valid CUID is expected)',
      );
    }
    return value;
  }
}
