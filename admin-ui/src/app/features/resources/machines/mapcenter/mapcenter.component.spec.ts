import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapcenterComponent } from './mapcenter.component';

describe('CreateComponent', () => {
  let component: MapcenterComponent;
  let fixture: ComponentFixture<MapcenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapcenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapcenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
