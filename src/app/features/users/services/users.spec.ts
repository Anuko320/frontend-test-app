import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { UsersService, USERS_STORAGE_KEY } from './users.service';
import { User } from '../../../core/models/user';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  const mockApiUsers = [
    {
      id: 1,
      name: 'Leanne Graham',
      email: 'Sincere@april.biz',
      phone: '1-770-736-8031 x56442',
    },
  ];

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load users from localStorage on init', () => {
    const stored: User[] = [
      { id: 99, name: 'Stored User', email: 'stored@test.com', phone: '123' },
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(stored));

    service.init();

    expect(service.users()).toEqual(stored);
    httpMock.expectNone('https://jsonplaceholder.typicode.com/users');
  });

  it('should fetch users from API when storage is empty', () => {
    service.init();

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockApiUsers);

    expect(service.users()).toEqual([
      {
        id: 1,
        name: 'Leanne Graham',
        email: 'Sincere@april.biz',
        phone: '1-770-736-8031 x56442',
      },
    ]);
    expect(localStorage.getItem(USERS_STORAGE_KEY)).toBeTruthy();
  });

  it('should add and delete users locally and persist to localStorage', () => {
    service.users.set([{ id: 1, name: 'A', email: 'a@test.com', phone: '1' }]);

    service.addUser({ name: 'B', email: 'b@test.com', phone: '2' });
    expect(service.users().length).toBe(2);
    expect(service.users()[0].name).toBe('B');

    const removed = service.deleteUser(1);
    expect(removed?.name).toBe('A');
    expect(service.users().length).toBe(1);
    expect(service.users()[0].name).toBe('B');

    const stored = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)!) as User[];
    expect(stored).toEqual(service.users());

    const reloaded = TestBed.inject(UsersService);
    reloaded.init();
    expect(reloaded.users()).toEqual(service.users());
  });

  it('should persist empty list after deleting all users', () => {
    service.users.set([{ id: 1, name: 'A', email: 'a@test.com', phone: '1' }]);
    service.deleteUser(1);

    expect(service.users()).toEqual([]);
    expect(JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)!)).toEqual([]);
  });

  it('should reload from API when reloadFromApi is called', () => {
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify([{ id: 1, name: 'Cached', email: 'c@test.com', phone: '1' }]),
    );

    service.reloadFromApi();

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush(mockApiUsers);

    expect(service.users()[0].name).toBe('Leanne Graham');
  });

  it('should set error when API fails', () => {
    service.init();

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toBe('Failed to load users. Please try again.');
    expect(service.users()).toEqual([]);
  });
});
