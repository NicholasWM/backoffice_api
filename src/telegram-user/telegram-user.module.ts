import { Module } from '@nestjs/common';
import { TelegramUserService } from './telegram-user.service';
import { TelegramUserController } from './telegram-user.controller';
import { TelegramUserRepository } from './telegram-user.repository';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([TelegramUserRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [TelegramUserController],
  providers: [TelegramUserService],
  exports:[TelegramUserService]
})
export class TelegramUserModule { }
