import { PartialType } from '@nestjs/mapped-types';
import { CreateTelegramUserDto } from './create-telegram-user.dto';

export class UpdateTelegramUserDto extends PartialType(CreateTelegramUserDto) {}
