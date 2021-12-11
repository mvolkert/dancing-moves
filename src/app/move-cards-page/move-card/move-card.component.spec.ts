import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavService } from 'src/app/services/nav.service';

import { MoveCardComponent } from './move-card.component';

describe('MovecardComponent', () => {
  let component: MoveCardComponent;
  let fixture: ComponentFixture<MoveCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveCardComponent ],
      providers: [{
          provide: NavService,
          useValue: {},
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
