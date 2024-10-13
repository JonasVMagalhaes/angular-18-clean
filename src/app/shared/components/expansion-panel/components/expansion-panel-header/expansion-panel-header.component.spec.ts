import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ExpansionPanelHeaderComponent
} from "@components/expansion-panel/components/expansion-panel-header/expansion-panel-header.component";


xdescribe(ExpansionPanelHeaderComponent.name, () => {
  let component: ExpansionPanelHeaderComponent;
  let fixture: ComponentFixture<ExpansionPanelHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpansionPanelHeaderComponent]
    });
    fixture = TestBed.createComponent(ExpansionPanelHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
