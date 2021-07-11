import { Test, TestingModule } from '@nestjs/testing';
import { BoatmanService } from './boatman.service';

describe('BoatmanService', () => {
  let service: BoatmanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoatmanService],
    }).compile();

    service = module.get<BoatmanService>(BoatmanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
