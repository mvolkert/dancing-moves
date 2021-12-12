import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ApiclientService } from './apiclient.service';

import { DataManagerService } from './data-manager.service';
import { NavService } from './nav.service';

describe('DataManagerService', () => {
  let service: DataManagerService;
  const activatedRoute: jasmine.SpyObj<ActivatedRoute> = jasmine.createSpyObj<ActivatedRoute>('ActivatedRoute', [],
    { params: of(), queryParams: of() });
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
        }
      ]
    });
    service = TestBed.inject(DataManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
