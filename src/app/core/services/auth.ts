import { Injectable, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  readonly authenticated = signal(false);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.authenticated.set(!!user);
    });
  }

  async login(login: string, password: string): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(this.auth, login, password);
      return true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.authenticated.set(false);
  }

  isAuthenticated(): boolean {
    return this.authenticated();
  }
}