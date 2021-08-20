import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { TelegramClientService } from './telegram-client.service';
import { CreateTelegramClientDto } from './dto/create-telegram-client.dto';
import { UpdateTelegramClientDto } from './dto/update-telegram-client.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Telegram Client')
@Controller('telegram-client')
export class TelegramClientController {
  constructor(private readonly telegramClientService: TelegramClientService) {}

  @Post()
  create(@Body() createTelegramClientDto: CreateTelegramClientDto) {
    return this.telegramClientService.create(createTelegramClientDto);
  }

  @Get()
  findAll() {
    return this.telegramClientService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.telegramClientService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTelegramClientDto: UpdateTelegramClientDto) {
    return this.telegramClientService.update(+id, updateTelegramClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.telegramClientService.remove(+id);
  }
}
