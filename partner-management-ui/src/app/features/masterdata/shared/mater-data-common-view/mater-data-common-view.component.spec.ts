import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterDataCommonViewComponent } from './mater-data-common-view.component';

describe('MaterDataCommonViewComponent', () => {
  let component: MaterDataCommonViewComponent;
  let fixture: ComponentFixture<MaterDataCommonViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterDataCommonViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterDataCommonViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
