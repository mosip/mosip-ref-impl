import { TestBed, async, inject } from '@angular/core/testing';

import { MasterdataGuard } from './masterdata.guard';

describe('MasterdataGuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MasterdataGuard]
    });
  });

  it('should ...', inject([MasterdataGuard], (guard: MasterdataGuard) => {
    expect(guard).toBeTruthy();
  }));
});
