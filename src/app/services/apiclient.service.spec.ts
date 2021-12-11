import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ApiclientService } from './apiclient.service';
import { SettingsService } from './settings.service';

describe('ApiclientService', () => {
  let service: ApiclientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SettingsService,
          useValue: {},
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
