import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavService } from '../services/nav.service';

import { DanceCardsPageComponent } from './dance-cards-page.component';

describe('DanceCardsPageComponent', () => {
  let component: DanceCardsPageComponent;
  let fixture: ComponentFixture<DanceCardsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DanceCardsPageComponent],
      providers: [{
        provide: NavService,
        useValue: {},
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
