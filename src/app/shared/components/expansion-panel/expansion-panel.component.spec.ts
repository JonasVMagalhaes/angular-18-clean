import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ExpansionPanelComponent} from "@components/expansion-panel/expansion-panel.component";


describe(ExpansionPanelComponent.name, () => {
  let component: ExpansionPanelComponent;
  let fixture: ComponentFixture<ExpansionPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpansionPanelComponent]
    });
    fixture = TestBed.createComponent(ExpansionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
