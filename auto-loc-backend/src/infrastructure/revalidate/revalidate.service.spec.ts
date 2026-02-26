import { Test, TestingModule } from '@nestjs/testing';
import { RevalidateService } from './revalidate.service';

describe('RevalidateService', () => {
  let service: RevalidateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RevalidateService],
    }).compile();

    service = module.get<RevalidateService>(RevalidateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
