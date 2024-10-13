import { TestBed } from '@angular/core/testing';

import {ScheduleService} from './schedule.service';


xdescribe(ScheduleService.name, () => {
  let service: ScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
