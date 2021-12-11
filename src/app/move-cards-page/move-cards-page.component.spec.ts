import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';

import { MoveCardsPageComponent } from './move-cards-page.component';

describe('MovesContentComponent', () => {
  let component: MoveCardsPageComponent;
  let fixture: ComponentFixture<MoveCardsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveCardsPageComponent],
      providers: [{
        provide: DataManagerService,
        useValue: {},
      }, {
        provide: NavService,
        useValue: {},
      }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveCardsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
