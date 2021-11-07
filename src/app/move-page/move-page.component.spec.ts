import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovePageComponent } from './move-page.component';

describe('MovePageComponent', () => {
  let component: MovePageComponent;
  let fixture: ComponentFixture<MovePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
