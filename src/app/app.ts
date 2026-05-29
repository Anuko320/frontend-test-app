import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeToggle } from './core/components/theme-toggle/theme-toggle';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {
    inject(ThemeService);
  }
}
