import { Module } from '@nestjs/common';
import { TelegramClientService } from './telegram-client.service';
import { TelegramClientController } from './telegram-client.controller';

@Module({
  controllers: [TelegramClientController],
  providers: [TelegramClientService]
})
export class TelegramClientModule {}
