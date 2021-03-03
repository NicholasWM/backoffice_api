import { HttpStatus } from '@nestjs/common';

export class BaseResponseDto{
    data: any
    statusCode: HttpStatus
    message: string
}