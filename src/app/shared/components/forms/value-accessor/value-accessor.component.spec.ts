import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueAccessorComponent } from './value-accessor.component';

xdescribe('ValueAcessorComponent', () => {
  let component: ValueAccessorComponent;
  let fixture: ComponentFixture<ValueAccessorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ValueAccessorComponent]
    });
    fixture = TestBed.createComponent(ValueAccessorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
