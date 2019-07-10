import { TestBed } from '@angular/core/testing';

import { CenterService } from './center.service';

describe('CenterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CenterService = TestBed.get(CenterService);
    expect(service).toBeTruthy();
  });
});
