import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovecardComponent } from './movecard.component';

describe('MovecardComponent', () => {
  let component: MovecardComponent;
  let fixture: ComponentFixture<MovecardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovecardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
