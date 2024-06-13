import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-abonamentachizitionat-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './abonamentachizitionat.page.html',
})
export class AbonamentAchizitionatPage {
  constructor(private router: Router, private route: ActivatedRoute) {}

  onNavigateToAccount() {
    this.router.navigate(['/contulmeu']);
  }
}
