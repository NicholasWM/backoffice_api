import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { FretesModule } from 'src/fretes/fretes.module';
import { ClientsModule } from 'src/clients/clients.module';

@Module({
  imports:[FretesModule, ClientsModule],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService]
})
export class TelegramModule {}
