import { Injectable, signal } from '@angular/core';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { getApp } from 'firebase/app';

import { User } from '../../../core/models/user';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private db = getFirestore(getApp());

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  init(): void {
    this.loading.set(true);
    this.error.set(null);

    const usersCollection = collection(this.db, 'users');

    onSnapshot(
      usersCollection,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<User, 'id'>),
        }));
        console.log('Firestore data:', data);
        this.users.set(data);
        this.loading.set(false);
        this.error.set(null);
      },
      (err) => {
        console.error('Firestore error:', err);
        this.error.set('Не удалось загрузить пользователей.');
        this.loading.set(false);
      },
    );
  }

  reloadFromApi(): void {
    this.init();
  }

  async addUser(input: Omit<User, 'id'>): Promise<void> {
    const usersCollection = collection(this.db, 'users');
    await addDoc(usersCollection, {
      name: input.name.trim(),
      email: input.email.trim(),
      city: input.city.trim(),
    });
  }

  async deleteUser(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'users', id));
  }

  async updateUser(updatedUser: User): Promise<void> {
    await updateDoc(doc(this.db, 'users', String(updatedUser.id)), {
      name: updatedUser.name.trim(),
      email: updatedUser.email.trim(),
      city: updatedUser.city.trim(),
    });
  }
}