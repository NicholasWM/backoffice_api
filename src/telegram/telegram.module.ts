import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { FretesModule } from 'src/fretes/fretes.module';

@Module({
  imports:[FretesModule],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService]
})
export class TelegramModule {}
