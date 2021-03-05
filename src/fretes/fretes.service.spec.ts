import { Test, TestingModule } from '@nestjs/testing';
import { FretesService } from './fretes.service';

describe('FretesService', () => {
  let service: FretesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FretesService],
    }).compile();

    service = module.get<FretesService>(FretesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
