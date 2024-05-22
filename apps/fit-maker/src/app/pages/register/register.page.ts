import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
  providers: [FireBaseStoreService],
  selector: 'app-register-page',
  templateUrl: './register.page.html',
})
export class RegisterPage {
  protected readonly registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly firebaseStoreService = inject(FireBaseStoreService);
  protected readonly changeDetector = inject(ChangeDetectorRef);

  isLoading = false;

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService
      .register(
        this.registerForm.value.email as string,
        this.registerForm.value.password as string
      )
      .subscribe({
        next: (response) => {
          const userInfo = {
            name: this.registerForm.value.name,
            email: this.registerForm.value.email,
            uid: response.user.uid,
            userType: UserType.User,
          };
          this.firebaseStoreService
            .addCollectionData('userInfo', userInfo)
            .subscribe({
              next: () => {
                this.isLoading = false;
                this.router.navigate(['/home']);
                this.changeDetector.detectChanges();
              },
            });
        },

        error: () => { },
      });
  }
}
