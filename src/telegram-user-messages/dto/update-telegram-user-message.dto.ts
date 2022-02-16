import { PartialType } from '@nestjs/mapped-types';
import { CreateTelegramUserMessageDto } from './create-telegram-user-message.dto';

export class UpdateTelegramUserMessageDto extends PartialType(CreateTelegramUserMessageDto) {}
