import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckBoxComponent } from './checkbox.component';

describe(CheckBoxComponent.name, () => {
  let component: CheckBoxComponent;
  let fixture: ComponentFixture<CheckBoxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CheckBoxComponent]
    });
    fixture = TestBed.createComponent(CheckBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
