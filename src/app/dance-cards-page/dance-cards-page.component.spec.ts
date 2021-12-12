import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { NavService } from '../services/nav.service';

import { DanceCardsPageComponent } from './dance-cards-page.component';

describe('DanceCardsPageComponent', () => {
  let component: DanceCardsPageComponent;
  let fixture: ComponentFixture<DanceCardsPageComponent>;
  const navService: jasmine.SpyObj<NavService> = jasmine.createSpyObj<NavService>('NavService',
    ['navigate', 'openWebsiteIfEasterEggFound'], { headlineObservable: new BehaviorSubject<string>("Dancing Moves") });
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DanceCardsPageComponent],
      providers: [{
        provide: NavService,
        useValue: navService,
      }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DanceCardsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
