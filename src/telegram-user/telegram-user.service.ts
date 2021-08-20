import { Injectable } from '@nestjs/common';
import { CreateTelegramUserDto } from './dto/create-telegram-user.dto';
import { UpdateTelegramUserDto } from './dto/update-telegram-user.dto';

@Injectable()
export class TelegramUserService {
  create(createTelegramUserDto: CreateTelegramUserDto) {
    return 'This action adds a new telegramUser';
  }

  findAll() {
    return `This action returns all telegramUser`;
  }

  findOne(id: number) {
    return `This action returns a #${id} telegramUser`;
  }

  update(id: number, updateTelegramUserDto: UpdateTelegramUserDto) {
    return `This action updates a #${id} telegramUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} telegramUser`;
  }
}
