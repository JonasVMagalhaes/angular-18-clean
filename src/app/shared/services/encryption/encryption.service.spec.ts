import { TestBed } from '@angular/core/testing';

import { EncryptionService } from './encryption.service';

describe(EncryptionService.name, () => {
  let service: EncryptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncryptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
