import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveCardsPageComponent } from './move-cards-page.component';

describe('MovesContentComponent', () => {
  let component: MoveCardsPageComponent;
  let fixture: ComponentFixture<MoveCardsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveCardsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveCardsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
