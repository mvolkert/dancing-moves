import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';
import { RelationsPageComponent } from './relations-page.component';


describe('RelationsPageComponent', () => {
  let component: RelationsPageComponent;
  let fixture: ComponentFixture<RelationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RelationsPageComponent], providers: [
        {
          provide: NavService,
          useValue: {},
        },
        {
          provide: DataManagerService,
          useValue: {},
        },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
