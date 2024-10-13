import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateFooterComponent } from './private-footer.component';

xdescribe('PrivateFooterComponent', () => {
  let component: PrivateFooterComponent;
  let fixture: ComponentFixture<PrivateFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
