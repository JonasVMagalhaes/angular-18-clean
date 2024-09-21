import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateRoutesComponent } from './public-routes.component';

describe('PrivateRoutesComponent', () => {
  let component: PrivateRoutesComponent;
  let fixture: ComponentFixture<PrivateRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateRoutesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivateRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
