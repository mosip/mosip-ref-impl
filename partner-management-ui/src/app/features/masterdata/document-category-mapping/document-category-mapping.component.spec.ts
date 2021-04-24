import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCategoryMappingComponent } from './document-category-mapping.component';

describe('DocumentCategoryMappingComponent', () => {
  let component: DocumentCategoryMappingComponent;
  let fixture: ComponentFixture<DocumentCategoryMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentCategoryMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentCategoryMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
