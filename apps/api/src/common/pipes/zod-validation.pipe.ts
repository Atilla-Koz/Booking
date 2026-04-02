import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, type ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    try {
      return this.schema.parse(value);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.flatten(),
          statusCode: 400,
        });
      }
      throw error;
    }
  }
}
