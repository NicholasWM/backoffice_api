import { forwardRef, Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { FretesModule } from 'src/fretes/fretes.module';
import { ClientsModule } from 'src/clients/clients.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramClientRepository } from 'src/telegram-client/telegram-client.repository';
import { TelegramUserRepository } from 'src/telegram-user/telegram-user.repository';
import { TelegramUserModule } from 'src/telegram-user/telegram-user.module';
import { TelegramUserMessageRepository } from 'src/telegram-user-messages/telegram-user.repository';
import { BoatmanModule } from 'src/boatman/boatman.module';
import { PricesModule } from 'src/prices/prices.module';
// import { FretesService } from 'src/fretes/fretes.service';

@Module({
  imports:[
    forwardRef(()=>FretesModule),
    // FretesModule,
    ClientsModule,
    TelegramUserModule,
    BoatmanModule,
    PricesModule,
    TypeOrmModule.forFeature([
      TelegramClientRepository,
      TelegramUserRepository,
      TelegramUserMessageRepository
    ]),
  ],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService]
})
export class TelegramModule {}
