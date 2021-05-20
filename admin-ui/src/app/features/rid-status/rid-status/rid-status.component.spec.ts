import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RidStatusComponent } from './rid-status.component';

describe('PacketStatusComponent', () => {
  let component: RidStatusComponent;
  let fixture: ComponentFixture<RidStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RidStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RidStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
