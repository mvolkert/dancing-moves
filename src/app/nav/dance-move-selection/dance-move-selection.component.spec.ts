import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DanceMoveSelectionComponent } from './dance-move-selection.component';

describe('DanceMoveSelectionComponent', () => {
  let component: DanceMoveSelectionComponent;
  let fixture: ComponentFixture<DanceMoveSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DanceMoveSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DanceMoveSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
