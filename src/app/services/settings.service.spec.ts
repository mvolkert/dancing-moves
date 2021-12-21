import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  const activatedRoute: jasmine.SpyObj<ActivatedRoute> = jasmine.createSpyObj<ActivatedRoute>('ActivatedRoute', [], { params: of() });
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        }, {
          provide: HttpClient,
          useValue: {},
        }
      ]
    });
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
