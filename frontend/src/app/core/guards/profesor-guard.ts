import { CanActivateFn } from '@angular/router';

export const profesorGuard: CanActivateFn = (route, state) => {
  return true;
};
