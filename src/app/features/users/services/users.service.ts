import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { User } from '../../../core/models/user';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);

  private usersSubject = new BehaviorSubject<User[]>([]);

  users$ = this.usersSubject.asObservable();

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(
      'https://jsonplaceholder.typicode.com/users'
    );
  }

  setUsers(users: User[]): void {
    this.usersSubject.next(users);

    localStorage.setItem(
      'users',
      JSON.stringify(users)
    );
  }

  deleteUser(id: number): void {
    const updatedUsers = this.usersSubject.value.filter(
      user => user.id !== id
    );

    this.usersSubject.next(updatedUsers);

    localStorage.setItem(
      'users',
      JSON.stringify(updatedUsers)
    );
  }

  loadUsersFromStorage(): User[] | null {
    const users = localStorage.getItem('users');

    return users ? JSON.parse(users) : null;
  }
}