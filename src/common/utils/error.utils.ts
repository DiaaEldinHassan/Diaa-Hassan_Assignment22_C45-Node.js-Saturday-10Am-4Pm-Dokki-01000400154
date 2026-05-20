import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

export class BadRequestError extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends NotFoundException {
  constructor(message: string) {
    super(message);
  }
}

export class ConflictError extends ConflictException {
  constructor(message: string) {
    super(message);
  }
}

export class InternalServerError extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
  }
}
