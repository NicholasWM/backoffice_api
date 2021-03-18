import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ContactRepository } from './contacts.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactRepository]),
    PassportModule.register({defaultStrategy: 'jwt'})
  ],
  controllers: [ContactsController],
  providers: [ContactsService]
})
export class ContactsModule {}
