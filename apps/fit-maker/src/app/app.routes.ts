import { Route, Router } from '@angular/router';
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
import { ContulMeuPage } from './pages/contulmeu/contulmeu.page';
import { AdminPageComponent } from './pages/adminmode/adminmode.page';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { filter, skip, tap } from 'rxjs';
import { isNil } from 'lodash-es';
import { CumparareAbonament } from './pages/cumparareabonament/cumparareabonament.page';
import { AbonamentAchizitionatPage } from './pages/abonmanetachizitionat/abonamentachizitionat.page';
import { ProduseNutritivePage } from './pages/produsenutritive/produsenutritive.page';
import { CumparareProduse } from './pages/cumparareproduse/cumparareproduse.page';
import { ProdusAchizitionatPage } from './pages/produsachizitionat/produsachizitionat.page';
import { AdaugareProdusPage } from './pages/adaugaproduse/adaugaproduse.page';
import { EditareProdusePage } from './pages/editareproduse/editareproduse.page';
import { ComenziProdusePage } from './pages/comenziproduse/comenziproduse.page';

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
    path: 'produsenutritive',
    component: ProduseNutritivePage,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'cumparareproduse/:id',
    component: CumparareProduse,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'produsachizitionat',
    component: ProdusAchizitionatPage,
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
    path: 'contulmeu',
    component: ContulMeuPage,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'abonamentachizitionat',
    component: AbonamentAchizitionatPage,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'cumparareabonament/:id',
    component: CumparareAbonament,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'adaugareproduse',
    component: AdaugareProdusPage,
    canActivate: [AuthGuard],
    canMatch: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        return authService.isAdmin$.pipe(
          filter((isAdmin) => {
            return !isNil(isAdmin);
          }),
          tap((isAdmin) => {
            console.log(isAdmin);
            if (!isAdmin) {
              void router.navigate(['/home']);
            }
          })
        );
      },
    ],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'editareproduse/:id',
    component: EditareProdusePage,
    canActivate: [AuthGuard],
    canMatch: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        return authService.isAdmin$.pipe(
          filter((isAdmin) => {
            return !isNil(isAdmin);
          }),
          tap((isAdmin) => {
            console.log(isAdmin);
            if (!isAdmin) {
              void router.navigate(['/home']);
            }
          })
        );
      },
    ],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'comenziproduse',
    component: ComenziProdusePage,
    canActivate: [AuthGuard],
    canMatch: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        return authService.isAdmin$.pipe(
          filter((isAdmin) => {
            return !isNil(isAdmin);
          }),
          tap((isAdmin) => {
            console.log(isAdmin);
            if (!isAdmin) {
              void router.navigate(['/home']);
            }
          })
        );
      },
    ],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'adminmode',
    component: AdminPageComponent,
    canActivate: [AuthGuard],
    canMatch: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        return authService.isAdmin$.pipe(
          filter((isAdmin) => {
            return !isNil(isAdmin);
          }),
          tap((isAdmin) => {
            console.log(isAdmin);
            if (!isAdmin) {
              void router.navigate(['/home']);
            }
          })
        );
      },
    ],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
