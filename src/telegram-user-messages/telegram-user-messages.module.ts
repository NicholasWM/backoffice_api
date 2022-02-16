import { Module } from '@nestjs/common';
import { TelegramUserMessagesService } from './telegram-user-messages.service';
import { TelegramUserMessagesController } from './telegram-user-messages.controller';
import { TelegramUserMessageRepository } from './telegram-user.repository';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([TelegramUserMessageRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [TelegramUserMessagesController],
  providers: [TelegramUserMessagesService]
})
export class TelegramUserMessagesModule {}
