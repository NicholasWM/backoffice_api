import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConnectToInstance } from 'src/telegram/types';
import { UsersService } from 'src/users/users.service';
import { CreateTelegramUserDto } from './dto/create-telegram-user.dto';
import { UpdateTelegramUserDto } from './dto/update-telegram-user.dto';
import { TelegramUserRepository } from './telegram-user.repository';

@Injectable()
export class TelegramUserService {
  constructor(
    @InjectRepository(TelegramUserRepository)
    private telegramUserRepository: TelegramUserRepository,

    private userService: UsersService
  ) {

  }

  async getById(id: string) {
    return await this.telegramUserRepository.findOne(id)
  }

  async create(createTelegramUserDto: CreateTelegramUserDto) {
    const userExist = await this.userService.findUserById(createTelegramUserDto.userId)
    if (!userExist.telegram) {
      const telegramUser = await this.telegramUserRepository.create().save()
      const user = await this.userService.addTelegram(createTelegramUserDto.userId, telegramUser)
      telegramUser.user = user
      await this.telegramUserRepository.save(telegramUser)
      delete user.telegram.user
      return user.telegram
    }
    return userExist.telegram
  }

  connectTelegramToInstance(iConnectToInstance: IConnectToInstance) {
    const { data, instanceId } = iConnectToInstance
    return this.telegramUserRepository.update({ id: instanceId }, data);
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} telegramUser`;
  // }

  // update(id: number, updateTelegramUserDto: UpdateTelegramUserDto) {
  //   return `This action updates a #${id} telegramUser`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} telegramUser`;
  // }
}
