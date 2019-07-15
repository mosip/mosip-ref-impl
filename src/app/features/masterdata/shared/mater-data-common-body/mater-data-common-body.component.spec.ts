import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterDataCommonBodyComponent } from './mater-data-common-body.component';

describe('MaterDataCommonBodyComponent', () => {
  let component: MaterDataCommonBodyComponent;
  let fixture: ComponentFixture<MaterDataCommonBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterDataCommonBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterDataCommonBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
