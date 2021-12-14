import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LostRidStatusComponent } from './lost-rid-status.component';

describe('PacketStatusComponent', () => {
  let component: LostRidStatusComponent;
  let fixture: ComponentFixture<LostRidStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LostRidStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LostRidStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
