import { Injectable } from '@nestjs/common';
import { CreateTelegramUserMessageDto } from './dto/create-telegram-user-message.dto';
import { UpdateTelegramUserMessageDto } from './dto/update-telegram-user-message.dto';

@Injectable()
export class TelegramUserMessagesService {
  create(createTelegramUserMessageDto: CreateTelegramUserMessageDto) {
    return 'This action adds a new telegramUserMessage';
  }

  findAll() {
    return `This action returns all telegramUserMessages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} telegramUserMessage`;
  }

  update(id: number, updateTelegramUserMessageDto: UpdateTelegramUserMessageDto) {
    return `This action updates a #${id} telegramUserMessage`;
  }

  remove(id: number) {
    return `This action removes a #${id} telegramUserMessage`;
  }
}
