import { Test, TestingModule } from '@nestjs/testing';
import { TelegramUserController } from './telegram-user.controller';
import { TelegramUserService } from './telegram-user.service';

describe('TelegramUserController', () => {
  let controller: TelegramUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelegramUserController],
      providers: [TelegramUserService],
    }).compile();

    controller = module.get<TelegramUserController>(TelegramUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
