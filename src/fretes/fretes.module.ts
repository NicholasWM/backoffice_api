import { Module } from '@nestjs/common';
import { FretesService } from './fretes.service';
import { FretesController } from './fretes.controller';

@Module({
  providers: [FretesService],
  controllers: [FretesController]
})
export class FretesModule {}
