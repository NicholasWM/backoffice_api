import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TelegramUserService } from './telegram-user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Telegram User')
@Controller('telegram-user')
export class TelegramUserController {
  constructor(private readonly telegramUserService: TelegramUserService) {}

  @Post()
  @ApiBearerAuth()
	@UseGuards(AuthGuard())
  async create(
    @GetUser() user,
  ) {
    return await this.telegramUserService.create(user);
  }

  @Get('/me')
  @ApiBearerAuth()
	@UseGuards(AuthGuard())
  async getMe(
    @GetUser() user,
    //  res:Response
  ) {
    return user.telegram || {};
  }

  // @Get()
  // findAll() {
  //   return this.telegramUserService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.telegramUserService.findOne(+id);
  // }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() updateTelegramUserDto: UpdateTelegramUserDto) {
  //   return this.telegramUserService.update(+id, updateTelegramUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.telegramUserService.remove(+id);
  // }
}
