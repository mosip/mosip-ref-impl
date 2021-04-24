import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HambergerMenuComponent } from './hamberger-menu.component';

describe('HambergerMenuComponent', () => {
  let component: HambergerMenuComponent;
  let fixture: ComponentFixture<HambergerMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HambergerMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HambergerMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
