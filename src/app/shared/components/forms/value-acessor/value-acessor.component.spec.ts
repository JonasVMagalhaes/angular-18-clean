import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueAcessorComponent } from './value-acessor.component';

xdescribe('ValueAcessorComponent', () => {
  let component: ValueAcessorComponent;
  let fixture: ComponentFixture<ValueAcessorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ValueAcessorComponent]
    });
    fixture = TestBed.createComponent(ValueAcessorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
