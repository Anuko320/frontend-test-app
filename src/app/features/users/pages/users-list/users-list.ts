import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users';
import { User } from '../../../../core/models/user';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.scss'],
})
export class UsersList implements OnInit {
  private usersService = inject(UsersService);
  private router = inject(Router);

  users: User[] = [];
  filteredUsers: User[] = [];

  search = '';

  newUserName = '';
  newUserEmail = '';
  newUserPhone = '';

  ngOnInit(): void {
  const savedUsers = localStorage.getItem('users');

  if (savedUsers) {
    this.users = JSON.parse(savedUsers);
    this.filteredUsers = this.users;

    return;
  }

  this.usersService.getUsers().subscribe((users) => {
    this.users = users;
    this.filteredUsers = users;

    this.saveUsers();
  });
}

logout(): void {
  localStorage.removeItem('isAuthenticated');

  this.router.navigate(['/login']);
}

  onSearch(): void {
    this.filteredUsers = this.users.filter((user) =>
      user.name.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  addUser(): void {

  if (
    !this.newUserName.trim() ||
    !this.newUserEmail.trim() ||
    !this.newUserPhone.trim()
  ) {
    return;
  }

  const newUser: User = {
    id: Date.now(),
    name: this.newUserName,
    email: this.newUserEmail,
    phone: this.newUserPhone,
  };

  this.users.unshift(newUser);

  this.saveUsers();

  this.onSearch();

  this.newUserName = '';
  this.newUserEmail = '';
  this.newUserPhone = '';
}

  private saveUsers(): void {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  deleteUser(id: number): void {
  const confirmed = confirm(
    'Are you sure you want to delete this user?'
  );

  if (!confirmed) {
    return;
  }

  this.users = this.users.filter(
    user => user.id !== id
  );

  this.onSearch();

  this.saveUsers();
}
}