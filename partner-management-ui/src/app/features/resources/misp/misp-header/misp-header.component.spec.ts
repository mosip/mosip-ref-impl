import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MispHeaderComponent } from './misp-header.component';

describe('CenterHeaderComponent', () => {
  let component: MispHeaderComponent;
  let fixture: ComponentFixture<MispHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MispHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MispHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
