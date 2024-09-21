import { TestBed } from '@angular/core/testing';

import { CacheService } from './cache.service';

describe(CacheService.name, () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
