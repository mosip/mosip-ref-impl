import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachinesHeaderComponent } from './machines-header.component';

describe('MachinesHeaderComponent', () => {
  let component: MachinesHeaderComponent;
  let fixture: ComponentFixture<MachinesHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachinesHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachinesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
