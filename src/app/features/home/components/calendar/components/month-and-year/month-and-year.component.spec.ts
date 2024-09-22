import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthAndYearComponent } from './month-and-year.component';

describe('MonthAndYearComponent', () => {
  let component: MonthAndYearComponent;
  let fixture: ComponentFixture<MonthAndYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthAndYearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthAndYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
