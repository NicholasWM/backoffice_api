import { Module } from '@nestjs/common';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceRepository } from './prices.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      PriceRepository
    ]),
    PassportModule.register({defaultStrategy: 'jwt'})
  ],
  controllers: [PricesController],
  providers: [PricesService]
})
export class PricesModule {}
