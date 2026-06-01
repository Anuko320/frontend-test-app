import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { ThemeToggle } from './core/components/theme-toggle/theme-toggle';
import { ThemeService } from './core/services/theme.service';

import { LanguageToggle } from './core/components/language-toggle/language-toggle';

import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle, LanguageToggle, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    inject(ThemeService);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}

