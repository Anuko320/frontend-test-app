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
  address?: {
    city: string;
  };
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
      city: input.city.trim(),
    };
    this.users.update((list) => [newUser, ...list]);
    this.persist();
  }

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
          this.error.set('Не удалось загрузить пользователей. API недоступно.');
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

      return parsed.map((item) => this.normalizeUser(item as Record<string, unknown>));
    } catch {
      localStorage.removeItem(USERS_STORAGE_KEY);
      return null;
    }
  }

  private normalizeUser(raw: Record<string, unknown>): User {
    return {
      id: Number(raw['id']),
      name: String(raw['name'] ?? ''),
      email: String(raw['email'] ?? ''),
      city: String(raw['city'] ?? raw['phone'] ?? ''),
    };
  }

  private mapApiUser(apiUser: ApiUser): User {
    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      city: apiUser.address?.city ?? '',
    };
  }
}
