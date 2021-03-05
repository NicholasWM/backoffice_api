import { Test, TestingModule } from '@nestjs/testing';
import { FretesController } from './fretes.controller';

describe('FretesController', () => {
  let controller: FretesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FretesController],
    }).compile();

    controller = module.get<FretesController>(FretesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
