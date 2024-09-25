import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientListItemComponent } from './patient-list-item.component';

describe(PatientListItemComponent.name, () => {
  let component: PatientListItemComponent;
  let fixture: ComponentFixture<PatientListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
