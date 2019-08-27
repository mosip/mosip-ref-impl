import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicesHeaderComponent } from './devices-header.component';

describe('DevicesHeaderComponent', () => {
  let component: DevicesHeaderComponent;
  let fixture: ComponentFixture<DevicesHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicesHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
