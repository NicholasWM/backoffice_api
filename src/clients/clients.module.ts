import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientRepository } from './clients.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[
    TypeOrmModule.forFeature([ClientRepository]),
		PassportModule.register({defaultStrategy:'jwt'}),
  ],
  providers: [ClientsService],
  controllers: [ClientsController],
})
export class ClientsModule {}
