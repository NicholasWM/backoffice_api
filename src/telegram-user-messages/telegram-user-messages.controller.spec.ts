import { Test, TestingModule } from '@nestjs/testing';
import { TelegramUserMessagesController } from './telegram-user-messages.controller';
import { TelegramUserMessagesService } from './telegram-user-messages.service';

describe('TelegramUserMessagesController', () => {
  let controller: TelegramUserMessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelegramUserMessagesController],
      providers: [TelegramUserMessagesService],
    }).compile();

    controller = module.get<TelegramUserMessagesController>(TelegramUserMessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
