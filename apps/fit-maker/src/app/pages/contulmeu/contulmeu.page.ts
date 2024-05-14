import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contulmeu',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './contulmeu.page.html',
})
export class ContulMeuPage {}
