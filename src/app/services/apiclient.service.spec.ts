import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { UserMode } from '../model/user-mode';

import { ApiclientService } from './apiclient.service';
import { SettingsService } from './settings.service';

describe('ApiclientService', () => {
  let service: ApiclientService;
  const settingsService: jasmine.SpyObj<SettingsService> = jasmine.createSpyObj<SettingsService>('SettingsService',
    ['fetchSettings', 'loading', 'initSettings'], { userMode: new BehaviorSubject<UserMode>(UserMode.test) });
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SettingsService,
          useValue: settingsService,
        }, {
          provide: HttpClient,
          useValue: {},
        },
      ]
    });
    service = TestBed.inject(ApiclientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
