import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { NavService } from 'src/app/services/nav.service';

import { RelationsSelectionComponent } from './relations-selection.component';

describe('RelationsSelectionComponent', () => {
  let component: RelationsSelectionComponent;
  let fixture: ComponentFixture<RelationsSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RelationsSelectionComponent],
      providers: [
        {
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
    fixture = TestBed.createComponent(RelationsSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
