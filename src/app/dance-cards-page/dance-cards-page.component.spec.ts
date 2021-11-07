import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DanceCardsPageComponent } from './dance-cards-page.component';

describe('DanceCardsPageComponent', () => {
  let component: DanceCardsPageComponent;
  let fixture: ComponentFixture<DanceCardsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DanceCardsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DanceCardsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
