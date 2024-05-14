import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  UserCredential,
} from '@angular/fire/auth';
import { isNil } from 'lodash-es';
import {
  BehaviorSubject,
  Observable,
  Subject,
  exhaustMap,
  from,
  startWith,
  tap,
} from 'rxjs';
import { FireBaseStoreService } from './firebasestore.service';

@Injectable()
export class AuthService {
  get isLoggedIn(): boolean {
    return !isNil(this.getCurrentUser());
  }

  private readonly fireAuth = inject(Auth);
  private readonly fireBaseStoreService = inject(FireBaseStoreService);

  readonly authChange$ = new Subject<void>();
  readonly isAdmin$ = new BehaviorSubject<boolean | undefined>(undefined);

  constructor() {
    this.authChange$
      .pipe(
        startWith(undefined),
        exhaustMap(() => {
          return this.fireBaseStoreService.getCustomCollention('userInfo', {
            firstField: 'userType',
            condition: '==',
            secondField: '1',
          });
        })
      )
      .subscribe({
        next: (response: any) => {
          const isAdmin = !!response?.find(
            (element: any) => element?.uid === this.getCurrentUser()?.uid
          );
          this.isAdmin$.next(isAdmin);
        },
      });
  }

  login(email: string, password: string): Observable<any> {
    return from(
      signInWithEmailAndPassword(this.fireAuth, email, password)
    ).pipe(
      tap(() => {
        this.authChange$.next();
      })
    );
  }

  logout(): Observable<void> {
    return from(this.fireAuth.signOut()).pipe(
      tap(() => {
        this.authChange$.next();
      })
    );
  }

  register(email: string, password: string): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(this.fireAuth, email, password)
    ).pipe(
      tap(() => {
        this.authChange$.next();
      })
    );
  }

  getCurrentUser(): FirebaseUser | null {
    return this.fireAuth.currentUser;
  }
}
