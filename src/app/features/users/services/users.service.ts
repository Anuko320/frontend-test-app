import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, of } from 'rxjs';

import { User } from '../../../core/models/user';

export const USERS_STORAGE_KEY = 'users';
const API_URL = 'https://jsonplaceholder.typicode.com/users';

interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  init(): void {
    const stored = this.loadFromStorage();
    if (stored !== null) {
      this.users.set(stored);
      return;
    }

    this.fetchFromApi();
  }

  /** Reload from API and replace local cache. */
  reloadFromApi(): void {
    localStorage.removeItem(USERS_STORAGE_KEY);
    this.users.set([]);
    this.fetchFromApi();
  }

  addUser(input: Omit<User, 'id'>): void {
    const newUser: User = {
      id: Date.now(),
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
    };
    this.users.update((list) => [newUser, ...list]);
    this.persist();
  }

  /** Removes user locally only; changes are saved to localStorage. */
  deleteUser(id: number): User | undefined {
    const removed = this.users().find((user) => user.id === id);
    this.users.update((list) => list.filter((user) => user.id !== id));
    this.persist();
    return removed;
  }

  private fetchFromApi(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<ApiUser[]>(API_URL)
      .pipe(
        map((data) => data.map((u) => this.mapApiUser(u))),
        catchError(() => {
          this.error.set('Failed to load users. Please try again.');
          return of<User[]>([]);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((users) => {
        this.users.set(users);
        this.persist();
      });
  }

  private persist(): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users()));
  }

  private loadFromStorage(): User[] | null {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return null;
      }
      return parsed as User[];
    } catch {
      localStorage.removeItem(USERS_STORAGE_KEY);
      return null;
    }
  }

  private mapApiUser(apiUser: ApiUser): User {
    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      phone: apiUser.phone,
    };
  }
}
