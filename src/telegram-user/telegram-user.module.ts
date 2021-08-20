import { Module } from '@nestjs/common';
import { TelegramUserService } from './telegram-user.service';
import { TelegramUserController } from './telegram-user.controller';

@Module({
  controllers: [TelegramUserController],
  providers: [TelegramUserService]
})
export class TelegramUserModule {}
