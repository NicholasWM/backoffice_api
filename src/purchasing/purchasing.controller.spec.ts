import { Test, TestingModule } from '@nestjs/testing';
import { PurchasingController } from './purchasing.controller';
import { PurchasingService } from './purchasing.service';

describe('PurchasingController', () => {
  let controller: PurchasingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasingController],
      providers: [PurchasingService],
    }).compile();

    controller = module.get<PurchasingController>(PurchasingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
