import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import { IGetAllTelegrams } from './types';

@ApiTags('Telegram')
@Controller('Telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}
  @Get()
  async getAll():Promise<IGetAllTelegrams>{
    return await this.telegramService.getAllTelegrams()
  }
  
}
