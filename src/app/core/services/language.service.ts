import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'ru';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  readonly language = signal<Language>('en');

  toggle(): void {
    this.language.update((lang) =>
      lang === 'en' ? 'ru' : 'en',
    );
  }
}