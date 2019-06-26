import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterHeaderComponent } from './center-header.component';

describe('CenterHeaderComponent', () => {
  let component: CenterHeaderComponent;
  let fixture: ComponentFixture<CenterHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CenterHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
