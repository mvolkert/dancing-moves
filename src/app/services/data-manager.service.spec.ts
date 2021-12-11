import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ApiclientService } from './apiclient.service';

import { DataManagerService } from './data-manager.service';
import { NavService } from './nav.service';

describe('DataManagerService', () => {
  let service: DataManagerService;

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
          useValue: {},
        }, {
          provide: NavService,
          useValue: {},
        }
      ]
    });
    service = TestBed.inject(DataManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
