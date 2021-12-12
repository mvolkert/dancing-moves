import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RelationParams } from '../model/relation-params';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';
import { RelationsPageComponent } from './relations-page.component';


describe('RelationsPageComponent', () => {
  let component: RelationsPageComponent;
  let fixture: ComponentFixture<RelationsPageComponent>;
  const dataManagerService: jasmine.SpyObj<DataManagerService> = jasmine.createSpyObj<DataManagerService>('DataManagerService',
    {
      start: undefined, loading: undefined, getMove: undefined, getGroupedMoveNames: undefined, getMovesNamesOf: undefined, getMovesNames: undefined,
      getDances: undefined, getCourseNames: undefined, getTypes: undefined, getRelationPairs: of(), saveOrCreate: undefined
    }, { relationsSelectionObservable: new BehaviorSubject<RelationParams>({} as RelationParams) });
  const navService: jasmine.SpyObj<NavService> = jasmine.createSpyObj<NavService>('NavService',
    ['navigate', 'openWebsiteIfEasterEggFound'], { headlineObservable: new BehaviorSubject<string>("Dancing Moves") });
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RelationsPageComponent], providers: [
        {
          provide: NavService,
          useValue: navService,
        },
        {
          provide: DataManagerService,
          useValue: dataManagerService,
        },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
