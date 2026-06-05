import { bootstrapApplication } from '@angular/platform-browser';
import { initializeApp } from 'firebase/app';
import { environment } from './environments/environment';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Инициализируем Firebase до запуска Angular
initializeApp(environment.firebase);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));