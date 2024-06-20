import { TestBed } from '@angular/core/testing';

import { AuditService } from './audit.service';

describe('AuditService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuditService = TestBed.get(AuditService);
    expect(service).toBeTruthy();
  });
});
