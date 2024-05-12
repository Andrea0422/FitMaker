import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'fit-makerr-root',
  providers: [AuthService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'fit-maker';

  protected readonly authService = inject(AuthService);
}
