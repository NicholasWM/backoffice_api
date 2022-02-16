import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { TelegramUserMessagesService } from './telegram-user-messages.service';
import { CreateTelegramUserMessageDto } from './dto/create-telegram-user-message.dto';
import { UpdateTelegramUserMessageDto } from './dto/update-telegram-user-message.dto';

@Controller('telegram-user-messages')
export class TelegramUserMessagesController {
  constructor(private readonly telegramUserMessagesService: TelegramUserMessagesService) {}

  @Post()
  create(@Body() createTelegramUserMessageDto: CreateTelegramUserMessageDto) {
    return this.telegramUserMessagesService.create(createTelegramUserMessageDto);
  }

  @Get()
  findAll() {
    return this.telegramUserMessagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.telegramUserMessagesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTelegramUserMessageDto: UpdateTelegramUserMessageDto) {
    return this.telegramUserMessagesService.update(+id, updateTelegramUserMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.telegramUserMessagesService.remove(+id);
  }
}
