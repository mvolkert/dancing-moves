import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { DataManagerService } from './services/data-manager.service';
import { SettingsService } from './services/settings.service';

describe('AppComponent', () => {

  const settingsService: jasmine.SpyObj<SettingsService> = jasmine.createSpyObj<SettingsService>('SettingsService',
    ['fetchSettings', 'loading', 'initSettings']);
  const dataManagerService: jasmine.SpyObj<DataManagerService> = jasmine.createSpyObj<DataManagerService>('DataManagerService',
    ['start', 'loading', 'getMove', 'getGroupedMoveNames', 'getMovesNamesOf', 'getMovesNames', 'getDances', 'getCourseNames', 
    'getTypes', 'getRelationPairs', 'saveOrCreate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        {
          provide: SettingsService,
          useValue: settingsService,
        }, {
          provide: DataManagerService,
          useValue: dataManagerService,
        },
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'dancing-moves'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('dancing-moves');
  });

});
