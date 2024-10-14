import {ComponentFixture, TestBed} from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
  })

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  describe('OnInit', () => {
    it('Must be call checkVersions', () => {
      const spyCheckVersions = spyOn(app['checkUpdatesService'], 'checkVersions');
      app.ngOnInit();

      expect(spyCheckVersions).toHaveBeenCalledTimes(1);
    });
  });
});
