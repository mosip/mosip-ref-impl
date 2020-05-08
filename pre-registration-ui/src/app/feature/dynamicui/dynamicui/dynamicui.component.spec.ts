import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicuiComponent } from './dynamicui.component';

describe('DynamicuiComponent', () => {
  let component: DynamicuiComponent;
  let fixture: ComponentFixture<DynamicuiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicuiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicuiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
