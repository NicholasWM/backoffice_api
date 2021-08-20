import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { TelegramUserService } from './telegram-user.service';
import { CreateTelegramUserDto } from './dto/create-telegram-user.dto';
import { UpdateTelegramUserDto } from './dto/update-telegram-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Telegram User')
@Controller('telegram-user')
export class TelegramUserController {
  constructor(private readonly telegramUserService: TelegramUserService) {}

  @Post()
  create(@Body() createTelegramUserDto: CreateTelegramUserDto) {
    return this.telegramUserService.create(createTelegramUserDto);
  }

  @Get()
  findAll() {
    return this.telegramUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.telegramUserService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTelegramUserDto: UpdateTelegramUserDto) {
    return this.telegramUserService.update(+id, updateTelegramUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.telegramUserService.remove(+id);
  }
}
