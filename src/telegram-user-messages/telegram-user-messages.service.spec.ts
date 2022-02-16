import { Test, TestingModule } from '@nestjs/testing';
import { TelegramUserMessagesService } from './telegram-user-messages.service';

describe('TelegramUserMessagesService', () => {
  let service: TelegramUserMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelegramUserMessagesService],
    }).compile();

    service = module.get<TelegramUserMessagesService>(TelegramUserMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
