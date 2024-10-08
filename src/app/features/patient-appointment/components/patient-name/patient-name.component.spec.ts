import { ComponentFixture, TestBed } from '@angular/core/testing';

import {PatientNameComponent} from './patient-name.component';

describe(PatientNameComponent.name, () => {
  let component: PatientNameComponent;
  let fixture: ComponentFixture<PatientNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientNameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
