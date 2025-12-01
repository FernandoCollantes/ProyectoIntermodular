import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { profesorGuard } from './profesor-guard';

describe('profesorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => profesorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
