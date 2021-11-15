import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveCardComponent } from './move-card.component';

describe('MovecardComponent', () => {
  let component: MoveCardComponent;
  let fixture: ComponentFixture<MoveCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
