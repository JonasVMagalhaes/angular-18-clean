import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpansionPanelDescriptionComponent } from './expansion-panel-description.component';


xdescribe(ExpansionPanelDescriptionComponent.name, () => {
  let component: ExpansionPanelDescriptionComponent;
  let fixture: ComponentFixture<ExpansionPanelDescriptionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpansionPanelDescriptionComponent]
    });
    fixture = TestBed.createComponent(ExpansionPanelDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
