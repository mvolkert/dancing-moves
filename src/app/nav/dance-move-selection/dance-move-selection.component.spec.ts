import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BehaviorSubject, of } from 'rxjs';
import { RelationParams } from 'src/app/model/relation-params';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { NavService } from 'src/app/services/nav.service';

import { DanceMoveSelectionComponent } from './dance-move-selection.component';

describe('DanceMoveSelectionComponent', () => {
  let component: DanceMoveSelectionComponent;
  let fixture: ComponentFixture<DanceMoveSelectionComponent>;
  const dataManagerService: jasmine.SpyObj<DataManagerService> = jasmine.createSpyObj<DataManagerService>('DataManagerService',
    {
      start: undefined, loading: undefined, getMove: undefined, getGroupedMoveNames: undefined, getMovesNamesOf: undefined, getMovesNames: undefined,
      getDances: undefined, getCourseNames: undefined, getTypes: undefined, getRelationPairs: of(), saveOrCreate: undefined
    }, { relationsSelectionObservable: new BehaviorSubject<RelationParams>({} as RelationParams) });
  const navService: jasmine.SpyObj<NavService> = jasmine.createSpyObj<NavService>('NavService',
    ['navigate', 'openWebsiteIfEasterEggFound'], { headlineObservable: new BehaviorSubject<string>("Dancing Moves") });
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatAutocompleteModule
      ],
      declarations: [DanceMoveSelectionComponent],
      providers: [{
        provide: DataManagerService,
        useValue: dataManagerService,
      }, {
        provide: NavService,
        useValue: navService,
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
