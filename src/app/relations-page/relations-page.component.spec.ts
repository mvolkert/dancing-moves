import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationsPageComponent } from './relations-page.component';

describe('RelationsPageComponent', () => {
  let component: RelationsPageComponent;
  let fixture: ComponentFixture<RelationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelationsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
