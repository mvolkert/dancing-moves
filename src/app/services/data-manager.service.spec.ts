import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { UserMode } from '../model/user-mode';
import { ApiclientService } from './apiclient.service';

import { DataManagerService } from './data-manager.service';
import { NavService } from './nav.service';
import { SettingsService } from './settings.service';

describe('DataManagerService', () => {
  let service: DataManagerService;
  const activatedRoute: jasmine.SpyObj<ActivatedRoute> = jasmine.createSpyObj<ActivatedRoute>('ActivatedRoute', [],
    { params: of(), queryParams: of() });
  const settingsService: jasmine.SpyObj<SettingsService> = jasmine.createSpyObj<SettingsService>('SettingsService',
    ['fetchSettings', 'loading', 'initSettings'], { userMode: new BehaviorSubject<UserMode>(UserMode.test) });
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiclientService,
          useValue: {},
        }, {
          provide: MatSnackBar,
          useValue: {},
        }, {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        }, {
          provide: NavService,
          useValue: {},
        }, {
          provide: SettingsService,
          useValue: settingsService,
        }
      ]
    });
    service = TestBed.inject(DataManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
