import { Module } from '@nestjs/common';
import { TelegramClientService } from './telegram-client.service';
import { TelegramClientController } from './telegram-client.controller';
import { TelegramClientRepository } from './telegram-client.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[
    TypeOrmModule.forFeature([TelegramClientRepository]),
		PassportModule.register({defaultStrategy:'jwt'}),
  ],
  controllers: [TelegramClientController],
  providers: [TelegramClientService]
})
export class TelegramClientModule {}
