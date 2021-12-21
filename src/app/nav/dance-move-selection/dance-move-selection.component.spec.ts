import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BehaviorSubject, of } from 'rxjs';
import { RelationParams } from 'src/app/model/relation-params';
import { UserMode } from 'src/app/model/user-mode';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { NavService } from 'src/app/services/nav.service';
import { SettingsService } from 'src/app/services/settings.service';

import { DanceMoveSelectionComponent } from './dance-move-selection.component';

describe('DanceMoveSelectionComponent', () => {
  let component: DanceMoveSelectionComponent;
  let fixture: ComponentFixture<DanceMoveSelectionComponent>;
  const dataManagerService: jasmine.SpyObj<DataManagerService> = jasmine.createSpyObj<DataManagerService>('DataManagerService',
    {
      start: undefined, loading: undefined, getMove: undefined, getGroupedMoveNames: undefined, getMovesNamesOf: undefined, getMovesNames: undefined,
      getDanceNames: undefined, getCourseNames: undefined, getTypes: undefined, getRelationPairs: of(), saveOrCreate: undefined
    }, { relationsSelectionObservable: new BehaviorSubject<RelationParams>({} as RelationParams) });
  const navService: jasmine.SpyObj<NavService> = jasmine.createSpyObj<NavService>('NavService',
    ['navigate', 'openWebsiteIfEasterEggFound'], { headlineObservable: new BehaviorSubject<string>("Dancing Moves") });
  const settingsService: jasmine.SpyObj<SettingsService> = jasmine.createSpyObj<SettingsService>('SettingsService',
    ['fetchSettings', 'loading', 'initSettings'], { userMode: new BehaviorSubject<UserMode>(UserMode.test) });
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
      }, {
        provide: SettingsService,
        useValue: settingsService,
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
