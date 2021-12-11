import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { NavService } from 'src/app/services/nav.service';

import { DanceMoveSelectionComponent } from './dance-move-selection.component';

describe('DanceMoveSelectionComponent', () => {
  let component: DanceMoveSelectionComponent;
  let fixture: ComponentFixture<DanceMoveSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DanceMoveSelectionComponent],
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
    fixture = TestBed.createComponent(DanceMoveSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
