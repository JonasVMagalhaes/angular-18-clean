import { TestBed } from '@angular/core/testing';

import {RegisterService} from "@entities/register/services/register.service";


xdescribe(RegisterService.name, () => {
  let service: RegisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
