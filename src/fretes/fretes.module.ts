import { Module } from '@nestjs/common';
import { FretesService } from './fretes.service';
import { FretesController } from './fretes.controller';
import { FretesRepository } from './fretes.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreteImagesRepository } from 'src/images/frete-images.repository';
import { ClientRepository } from 'src/clients/clients.repository';
import { PassportModule } from '@nestjs/passport';
import { PriceRepository } from 'src/prices/prices.repository';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      FretesRepository,
      FreteImagesRepository,
      ClientRepository,
      PriceRepository
    ]),
    PassportModule.register({defaultStrategy: 'jwt'})
  ],
  providers: [FretesService],
  controllers: [FretesController]
})
export class FretesModule {}
