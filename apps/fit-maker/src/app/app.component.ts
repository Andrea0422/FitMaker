import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { FireBaseStoreService } from './core/services/firebasestore.service';
import { Observable, exhaustMap, first } from 'rxjs';

@Component({
  selector: 'fit-makerr-root',
  providers: [FireBaseStoreService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'fit-maker';

  protected readonly authService = inject(AuthService);
  protected readonly fireBaseStoreService = inject(FireBaseStoreService);
  protected readonly changeDetector = inject(ChangeDetectorRef);

  private readonly router = inject(Router);

  logout() {
    this.authService.logout().subscribe({
      next: (ceva) => {
        this.router.navigate(['/login']);
      },
    });
  }
}
