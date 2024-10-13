import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateRoutesComponent } from './private-routes.component';
import {RouterModule} from "@angular/router";

xdescribe('PrivateRoutesComponent', () => {
  let component: PrivateRoutesComponent;
  let fixture: ComponentFixture<PrivateRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule,
      ]
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
