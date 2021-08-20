import { Injectable } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateTelegramClientDto } from './dto/create-telegram-client.dto';
import { UpdateTelegramClientDto } from './dto/update-telegram-client.dto';

@ApiTags('Telegram Client')
@Injectable()
export class TelegramClientService {
  create(createTelegramClientDto: CreateTelegramClientDto) {
    return 'This action adds a new telegramClient';
  }

  findAll() {
    return `This action returns all telegramClient`;
  }

  findOne(id: number) {
    return `This action returns a #${id} telegramClient`;
  }

  update(id: number, updateTelegramClientDto: UpdateTelegramClientDto) {
    return `This action updates a #${id} telegramClient`;
  }

  remove(id: number) {
    return `This action removes a #${id} telegramClient`;
  }
}
