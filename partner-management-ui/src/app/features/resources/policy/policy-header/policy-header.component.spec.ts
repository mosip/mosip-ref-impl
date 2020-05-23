import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyHeaderComponent } from './policy-header.component';

describe('PolicyHeaderComponent', () => {
  let component: PolicyHeaderComponent;
  let fixture: ComponentFixture<PolicyHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
