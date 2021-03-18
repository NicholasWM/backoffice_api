import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientRepository } from './clients.repository';
import { PassportModule } from '@nestjs/passport';
import { ContactRepository } from 'src/contacts/contacts.repository';

@Module({
  imports:[
    TypeOrmModule.forFeature([ClientRepository, ContactRepository]),
		PassportModule.register({defaultStrategy:'jwt'}),
  ],
  providers: [ClientsService],
  controllers: [ClientsController],
})
export class ClientsModule {}
