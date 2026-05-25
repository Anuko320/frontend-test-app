import { Injectable, signal } from '@angular/core';

const AUTH_KEY = 'isAuthenticated';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly authenticated = signal(this.readFromStorage());

  login(login: string, password: string): boolean {
    if (login === 'admin' && password === 'admin') {
      localStorage.setItem(AUTH_KEY, 'true');
      this.authenticated.set(true);
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
    this.authenticated.set(false);
  }

  isAuthenticated(): boolean {
    return this.authenticated();
  }

  private readFromStorage(): boolean {
    return localStorage.getItem(AUTH_KEY) === 'true';
  }
}
