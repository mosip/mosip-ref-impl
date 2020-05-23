import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterDataCommonHeaderComponent } from './mater-data-common-header.component';

describe('MaterDataCommonHeaderComponent', () => {
  let component: MaterDataCommonHeaderComponent;
  let fixture: ComponentFixture<MaterDataCommonHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterDataCommonHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterDataCommonHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
