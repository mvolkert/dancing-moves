import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RelationParams } from '../model/relation-params';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';

import { CourseCardsPageComponent } from './course-cards-page.component';

describe('CourseCardsPageComponent', () => {

  let component: CourseCardsPageComponent;
  let fixture: ComponentFixture<CourseCardsPageComponent>;
  const dataManagerService: jasmine.SpyObj<DataManagerService> = jasmine.createSpyObj<DataManagerService>('DataManagerService',
    {
      start: undefined, loading: undefined, getMove: undefined, getGroupedMoveNames: undefined, getMovesNamesOf: undefined, getMovesNames: undefined,
      getDanceNames: undefined, getCourseNames: undefined, getTypes: undefined, getRelationPairs: of(), saveOrCreate: undefined
    }, { relationsSelectionObservable: new BehaviorSubject<RelationParams>({} as RelationParams) });
  const navService: jasmine.SpyObj<NavService> = jasmine.createSpyObj<NavService>('NavService',
    ['navigate', 'openWebsiteIfEasterEggFound'], { headlineObservable: new BehaviorSubject<string>("Courses") });
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CourseCardsPageComponent],
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
    fixture = TestBed.createComponent(CourseCardsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
