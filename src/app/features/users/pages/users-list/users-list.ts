import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { AuthService } from '../../../../core/services/auth';
import { UsersService } from '../../services/users.service';

const SEARCH_DEBOUNCE_MS = 300;
const DELETE_MESSAGE_MS = 3000;

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
  private readonly destroyRef = inject(DestroyRef);
  private deleteMessageTimer: ReturnType<typeof setTimeout> | null = null;

  readonly users = this.usersService.users;
  readonly loading = this.usersService.loading;
  readonly error = this.usersService.error;

  readonly searchInput = signal('');
  readonly pendingDeleteId = signal<number | null>(null);
  readonly showAddUserPanel = signal(false);
  readonly deleteMessage = signal<string | null>(null);

  readonly debouncedSearch = toSignal(
    toObservable(this.searchInput).pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  readonly isSearchPending = computed(
    () => this.searchInput().trim() !== this.debouncedSearch().trim(),
  );

  readonly filteredUsers = computed(() => {
    const query = this.debouncedSearch().trim().toLowerCase();
    const list = this.users();

    if (!query) {
      return list;
    }

    return list.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query),
    );
  });

  readonly totalUsers = computed(() => this.users().length);
  readonly visibleUsers = computed(() => this.filteredUsers().length);

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

    this.destroyRef.onDestroy(() => {
      if (this.deleteMessageTimer !== null) {
        window.clearTimeout(this.deleteMessageTimer);
      }
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput.set(value);
  }

  clearSearch(): void {
    this.searchInput.set('');
  }

  retryLoad(): void {
    this.usersService.reloadFromApi();
  }

  toggleAddUserPanel(): void {
    this.showAddUserPanel.update((open) => !open);
  }

  closeAddUserPanel(): void {
    this.showAddUserPanel.set(false);
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
      this.showAddUserPanel.set(false);
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

    const removed = this.usersService.deleteUser(id);
    this.pendingDeleteId.set(null);

    if (removed) {
      this.showDeleteMessage(`${removed.name} удалён локально`);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private showDeleteMessage(message: string): void {
    if (this.deleteMessageTimer !== null) {
      window.clearTimeout(this.deleteMessageTimer);
    }

    this.deleteMessage.set(message);
    this.deleteMessageTimer = window.setTimeout(() => {
      this.deleteMessage.set(null);
      this.deleteMessageTimer = null;
    }, DELETE_MESSAGE_MS);
  }
}
