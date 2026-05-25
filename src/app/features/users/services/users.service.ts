import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, of } from 'rxjs';

import { User } from '../../../core/models/user';

const STORAGE_KEY = 'users';
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
    if (stored) {
      this.users.set(stored);
      return;
    }

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
        if (users.length > 0) {
          this.persist();
        }
      });
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

  deleteUser(id: number): void {
    this.users.update((list) => list.filter((user) => user.id !== id));
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.users()));
  }

  private loadFromStorage(): User[] | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User[];
    } catch {
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
