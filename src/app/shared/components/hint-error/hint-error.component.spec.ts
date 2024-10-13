import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HintErrorComponent } from './hint-error.component';

xdescribe(HintErrorComponent.name, () => {
  let component: HintErrorComponent;
  let fixture: ComponentFixture<HintErrorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HintErrorComponent]
    });
    fixture = TestBed.createComponent(HintErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
