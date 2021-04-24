import { TestBed } from '@angular/core/testing';

import { DocumentCategoryMappingService } from './document-category-mapping.service';

describe('DocumentCategoryMappingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DocumentCategoryMappingService = TestBed.get(DocumentCategoryMappingService);
    expect(service).toBeTruthy();
  });
});
