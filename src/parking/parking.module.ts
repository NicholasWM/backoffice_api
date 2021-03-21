import { Module } from '@nestjs/common';
import { ParkingService } from './parking.service';
import { ParkingController } from './parking.controller';
import { ParkingRepository } from './parking.repository';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[ 
		TypeOrmModule.forFeature([ParkingRepository]),
		PassportModule.register({defaultStrategy:'jwt'}),
	],
  controllers: [ParkingController],
  providers: [ParkingService]
})
export class ParkingModule {}
