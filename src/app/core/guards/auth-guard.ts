import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = getAuth();

  return from(auth.authStateReady()).pipe(
    map(() => {
      if (auth.currentUser) {
        return true;
      }
      return router.createUrlTree(['/login']);
    }),
  );
};