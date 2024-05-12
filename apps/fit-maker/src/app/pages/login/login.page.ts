import { NgIf } from '@angular/common';
import { Component, OnChanges, SimpleChanges, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  providers: [AuthService],
  selector: 'app-login-page',
  templateUrl: './login.page.html',
})
export class LoginPage {
  protected readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.authService
      .login(
        this.loginForm.value.email as string,
        this.loginForm.value.password as string
      )
      .subscribe({
        next: (ceva) => {
          this.router.navigate(['/home']);
        },
        error: (ceva) => {
          console.log(ceva);
        },
      });
  }
}
