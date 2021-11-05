import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovesContentComponent } from './moves-content.component';

describe('MovesContentComponent', () => {
  let component: MovesContentComponent;
  let fixture: ComponentFixture<MovesContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovesContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovesContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
