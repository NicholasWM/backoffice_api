import { PartialType } from '@nestjs/mapped-types';
import { CreateTelegramClientDto } from './create-telegram-client.dto';

export class UpdateTelegramClientDto extends PartialType(CreateTelegramClientDto) {}
