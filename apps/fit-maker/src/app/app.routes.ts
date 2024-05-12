import { Route } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { HomePage } from './pages/home/home.page';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { DesprePage } from './pages/despre/despre.page';
import { AbonamentePage } from './pages/abonamente/abonmanete.page';
import { RegisterPage } from './pages/register/register.page';

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
    path: 'despre',
    component: DesprePage,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'abonamente',
    component: AbonamentePage,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'register',
    component: RegisterPage,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToProjects },
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
