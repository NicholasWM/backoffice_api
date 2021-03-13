import { Module } from '@nestjs/common';
import { FretesService } from './fretes.service';
import { FretesController } from './fretes.controller';
import { FretesRepository } from './fretes.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreteImagesRepository } from 'src/images/frete-images.repository';
import { ClientRepository } from 'src/clients/clients.repository';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      FretesRepository,
      FreteImagesRepository,
      ClientRepository
    ]),
  ],
  providers: [FretesService],
  controllers: [FretesController]
})
export class FretesModule {}
