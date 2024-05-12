import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  UserCredential,
} from '@angular/fire/auth';
import { isNil } from 'lodash-es';
import { Observable, from } from 'rxjs';

@Injectable()
export class AuthService {
  get isLoggedIn(): boolean {
    return !isNil(this.getCurrentUser());
  }
  private readonly fireAuth = inject(Auth);

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.fireAuth, email, password));
  }

  logout(): Observable<void> {
    return from(this.fireAuth.signOut());
  }

  register(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.fireAuth, email, password));
  }

  getCurrentUser(): FirebaseUser | null {
    return this.fireAuth.currentUser;
  }
}
