import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';

import { UsersList } from './users-list';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../../../core/services/auth';
import { User } from '../../../../core/models/user';

describe('UsersList', () => {
  let component: UsersList;
  let fixture: ComponentFixture<UsersList>;
  let usersSignal: ReturnType<typeof signal<User[]>>;
  let deleteUserSpy: ReturnType<typeof vi.fn>;

  const mockUsers: User[] = [
    { id: 1, name: 'Alice', email: 'alice@test.com', phone: '111' },
    { id: 2, name: 'Bob', email: 'bob@test.com', phone: '222' },
  ];

  beforeEach(async () => {
    usersSignal = signal<User[]>(mockUsers);
    deleteUserSpy = vi.fn((id: number) => mockUsers.find((u) => u.id === id));

    await TestBed.configureTestingModule({
      imports: [UsersList],
      providers: [
        provideRouter([]),
        {
          provide: UsersService,
          useValue: {
            users: usersSignal,
            loading: signal(false),
            error: signal<string | null>(null),
            init: () => undefined,
            addUser: vi.fn(),
            deleteUser: deleteUserSpy,
            reloadFromApi: vi.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            logout: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter users by debounced search query', async () => {
    component.searchInput.set('alice');
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].name).toBe('Alice');
  });

  it('should filter by email with debounce', async () => {
    component.searchInput.set('bob@test.com');
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].name).toBe('Bob');
  });

  it('should show pending state before debounce completes', () => {
    component.searchInput.set('alice');

    expect(component.isSearchPending()).toBe(true);
    expect(component.filteredUsers().length).toBe(2);
  });

  it('should show empty state when no users match search', async () => {
    component.searchInput.set('zzz');
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(component.filteredUsers().length).toBe(0);

    const emptyEl = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyEl?.textContent).toContain('No users match your search');
  });

  it('should delete user locally via service', () => {
    component.requestDelete(1);
    component.confirmDelete();

    expect(deleteUserSpy).toHaveBeenCalledWith(1);
    expect(component.deleteMessage()).toContain('удалён локально');
  });
});
