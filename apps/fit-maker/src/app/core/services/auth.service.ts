import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  UserCredential,
} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly fireAuth = inject(Auth);

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.fireAuth, email, password));
  }

  logout(): Observable<void> {
    return from(this.fireAuth.signOut());
  }
}
