import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { UserType } from '../../core/enums/user-type.enum';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  providers: [AuthService, FireBaseStoreService],
  selector: 'app-register-page',
  templateUrl: './register.page.html',
})
export class RegisterPage {
  protected readonly registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly firebaseStoreService = inject(FireBaseStoreService);

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.authService
      .register(
        this.registerForm.value.email as string,
        this.registerForm.value.password as string
      )
      .subscribe({
        next: (response) => {
          const userInfo = {
            email: this.registerForm.value.email,
            uid: response.user.uid,
            userType: UserType.User,
          };
          this.firebaseStoreService
            .addCollectionData('userInfo', userInfo)
            .subscribe({
              next: () => {
                this.router.navigate(['/home']);
              },
            });
        },

        error: () => {},
      });
  }
}
