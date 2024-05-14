import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  logout() {
    this.authService.logout().subscribe({
      next: (ceva) => {
        this.router.navigate(['/login']);
      },
    });
  }
}
