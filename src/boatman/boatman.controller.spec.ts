import { Test, TestingModule } from '@nestjs/testing';
import { BoatmanController } from './boatman.controller';
import { BoatmanService } from './boatman.service';

describe('BoatmanController', () => {
  let controller: BoatmanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoatmanController],
      providers: [BoatmanService],
    }).compile();

    controller = module.get<BoatmanController>(BoatmanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
