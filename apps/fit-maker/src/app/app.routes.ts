import { Route } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { HomePage } from './pages/home/home.page';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToProjects = () => redirectLoggedInTo(['home']);

export const appRoutes: Array<Route> = [
  {
    path: 'login',
    component: LoginPage,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToProjects },
  },
  {
    path: 'home',
    component: HomePage,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
