import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketStatusComponent } from './packet-status.component';

describe('PacketStatusComponent', () => {
  let component: PacketStatusComponent;
  let fixture: ComponentFixture<PacketStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
