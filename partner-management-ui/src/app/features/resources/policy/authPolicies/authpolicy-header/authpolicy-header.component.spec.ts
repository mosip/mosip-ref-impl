import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthpolicyHeaderComponent } from './authpolicy-header.component';

describe('AuthpolicyHeaderComponent', () => {
  let component: AuthpolicyHeaderComponent;
  let fixture: ComponentFixture<AuthpolicyHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthpolicyHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthpolicyHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
