import { Test, TestingModule } from '@nestjs/testing';
import { TelegramClientController } from './telegram-client.controller';
import { TelegramClientService } from './telegram-client.service';

describe('TelegramClientController', () => {
  let controller: TelegramClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelegramClientController],
      providers: [TelegramClientService],
    }).compile();

    controller = module.get<TelegramClientController>(TelegramClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
