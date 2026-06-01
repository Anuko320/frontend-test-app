import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { ThemeToggle } from './core/components/theme-toggle/theme-toggle';
import { ThemeService } from './core/services/theme.service';

import { LanguageToggle } from './core/components/language-toggle/language-toggle';
import { LanguageService } from './core/services/language.service';

import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle, LanguageToggle],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly languageService = inject(LanguageService);

  readonly isAuthenticated = computed(() =>
    this.authService.isAuthenticated()
  );

  constructor() {
    inject(ThemeService);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}

