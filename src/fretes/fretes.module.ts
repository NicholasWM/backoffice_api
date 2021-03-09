import { Module } from '@nestjs/common';
import { FretesService } from './fretes.service';
import { FretesController } from './fretes.controller';
import { FretesRepository } from './fretes.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      FretesRepository
    ]),
  ],
  providers: [FretesService],
  controllers: [FretesController]
})
export class FretesModule {}
