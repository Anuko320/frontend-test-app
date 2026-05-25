import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, required, submit } from '@angular/forms/signals';

import { AuthService } from '../../../../core/services/auth';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users-list',
  imports: [FormField],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersList {
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly users = this.usersService.users;
  readonly loading = this.usersService.loading;
  readonly error = this.usersService.error;

  readonly search = signal('');
  readonly pendingDeleteId = signal<number | null>(null);

  readonly filteredUsers = computed(() => {
    const query = this.search().trim().toLowerCase();
    const list = this.users();

    if (!query) {
      return list;
    }

    return list.filter((user) => user.name.toLowerCase().includes(query));
  });

  readonly newUserModel = signal({
    name: '',
    email: '',
    phone: '',
  });

  readonly newUserForm = form(this.newUserModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });
    required(schemaPath.email, { message: 'Email is required' });
    required(schemaPath.phone, { message: 'Phone is required' });
  });

  readonly canAddUser = computed(() => this.newUserForm().valid());

  constructor() {
    this.usersService.init();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
  }

  addUser(): void {
    submit(this.newUserForm, async () => {
      const model = this.newUserModel();
      this.usersService.addUser({
        name: model.name,
        email: model.email,
        phone: model.phone,
      });
      this.newUserModel.set({ name: '', email: '', phone: '' });
    });
  }

  requestDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) {
      return;
    }

    this.usersService.deleteUser(id);
    this.pendingDeleteId.set(null);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
