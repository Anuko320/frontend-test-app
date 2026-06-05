import { Injectable, signal } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth();
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