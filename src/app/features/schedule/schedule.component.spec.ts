import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduleFeatureComponent } from "@features/schedule/schedule.component";


describe(ScheduleFeatureComponent.name, () => {
  let component: ScheduleFeatureComponent;
  let fixture: ComponentFixture<ScheduleFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
