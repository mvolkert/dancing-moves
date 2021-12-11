import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { NavService } from './nav.service';

describe('NavService', () => {
  let service: NavService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {},
        }
      ]
    });
    service = TestBed.inject(NavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
