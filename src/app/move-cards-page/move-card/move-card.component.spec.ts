import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { MoveDto } from 'src/app/model/move-dto';
import { NavService } from 'src/app/services/nav.service';

import { MoveCardComponent } from './move-card.component';

describe('MovecardComponent', () => {
  let component: MoveCardComponent;
  let fixture: ComponentFixture<MoveCardComponent>;
  const navService: jasmine.SpyObj<NavService> = jasmine.createSpyObj<NavService>('NavService',
    ['navigate', 'openWebsiteIfEasterEggFound'], { headlineObservable: new BehaviorSubject<string>("Dancing Moves") });
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveCardComponent],
      providers: [{
        provide: NavService,
        useValue: navService,
      }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveCardComponent);
    component = fixture.componentInstance;
    component.moveDto = {} as MoveDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
