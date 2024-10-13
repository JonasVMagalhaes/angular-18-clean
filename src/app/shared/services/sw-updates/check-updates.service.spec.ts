import { TestBed } from '@angular/core/testing';

import { CheckUpdatesService } from './check-updates.service';

xdescribe(CheckUpdatesService.name, () => {
  let service: CheckUpdatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckUpdatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
