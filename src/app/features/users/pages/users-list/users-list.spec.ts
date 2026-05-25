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

  const mockUsers: User[] = [
    { id: 1, name: 'Alice', email: 'alice@test.com', phone: '111' },
    { id: 2, name: 'Bob', email: 'bob@test.com', phone: '222' },
  ];

  beforeEach(async () => {
    usersSignal = signal<User[]>(mockUsers);

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
            deleteUser: vi.fn(),
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

  it('should filter users by search query', () => {
    component.search.set('alice');
    fixture.detectChanges();

    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].name).toBe('Alice');
  });

  it('should show empty state when no users match search', () => {
    component.search.set('zzz');
    fixture.detectChanges();

    expect(component.filteredUsers().length).toBe(0);

    const emptyEl = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyEl?.textContent).toContain('No users found');
  });
});
