import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';
import { SettingsService } from '../services/settings.service';

import { MovePageComponent } from './move-page.component';

describe('MovePageComponent', () => {
  let component: MovePageComponent;
  let fixture: ComponentFixture<MovePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MovePageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {},
        }, {
          provide: DataManagerService,
          useValue: {},
        }, {
          provide: SettingsService,
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
    fixture = TestBed.createComponent(MovePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
