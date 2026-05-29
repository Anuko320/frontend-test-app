import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ThemeToggle } from './core/components/theme-toggle/theme-toggle';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly currentLang = signal('en');
  private readonly translate = inject(TranslateService);

  constructor() {
    inject(ThemeService);

    const savedLanguage = localStorage.getItem('app-lang');
    const language = savedLanguage === 'ru' ? 'ru' : 'en';

    this.translate.addLangs(['en', 'ru']);
    this.translate.setDefaultLang('en');
    this.translate.use(language);
    this.currentLang.set(language);
  }

  switchLanguage(lang: 'en' | 'ru'): void {
    this.translate.use(lang);
    localStorage.setItem('app-lang', lang);
    this.currentLang.set(lang);
  }
}
