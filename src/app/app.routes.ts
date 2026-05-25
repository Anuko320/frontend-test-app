import { Routes } from '@angular/router';

import { Login } from './features/auth/pages/login/login';
import { UsersList } from './features/users/pages/users-list/users-list';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'users',
    component: UsersList,
    canActivate: [authGuard],
  },
];