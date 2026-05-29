import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeToggle } from './core/components/theme-toggle/theme-toggle';
import { ThemeService } from './core/services/theme.service';

import { LanguageToggle } from './core/components/language-toggle/language-toggle';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle, LanguageToggle],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly languageService = inject(LanguageService);

  constructor() {
    inject(ThemeService);
  }
  logout(): void {
    localStorage.clear();
    location.reload();
  }
}

