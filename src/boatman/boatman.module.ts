import { forwardRef, Module } from '@nestjs/common';
import { BoatmanService } from './boatman.service';
import { BoatmanController } from './boatman.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoatmanRepository } from './boatman.repository';
import { FretesModule } from 'src/fretes/fretes.module';

@Module({
  imports:[
    forwardRef(()=> FretesModule),
    TypeOrmModule.forFeature([
      BoatmanRepository,
    ]),
    PassportModule.register({defaultStrategy: 'jwt'})
  ],
  controllers: [BoatmanController],
  providers: [BoatmanService],
  exports:[BoatmanService]
})
export class BoatmanModule {}
