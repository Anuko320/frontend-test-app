import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  login(login: string, password: string): boolean {
    if (login === 'admin' && password === 'admin') {
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem('isAuthenticated');
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }
}