import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-despre',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './despre.page.html',
})
export class DesprePage {}
