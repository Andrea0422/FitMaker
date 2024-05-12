import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-abonament-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './abonamente.page.html',
})
export class AbonamentePage {}
