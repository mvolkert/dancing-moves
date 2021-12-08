import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationsSelectionComponent } from './relations-selection.component';

describe('RelationsSelectionComponent', () => {
  let component: RelationsSelectionComponent;
  let fixture: ComponentFixture<RelationsSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelationsSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationsSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
