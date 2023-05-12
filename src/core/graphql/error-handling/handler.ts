import {
  HttpStatus,
  BadRequestException,
  ConflictException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';

interface ErrorParams {
  error: string;
  description?: string;
}

export const getGraphQLError = (status: HttpStatus, params: ErrorParams) => {
  const { error, description } = params;

  switch (status) {
    case HttpStatus.BAD_REQUEST:
      throw new BadRequestException(error, { cause: new Error(), description });
    case HttpStatus.CONFLICT:
      throw new ConflictException(error, { cause: new Error(), description });
    case HttpStatus.NOT_FOUND:
      throw new NotFoundException(error, { cause: new Error(), description });
    default:
      throw new HttpException(error, status, { description });
  }
};
