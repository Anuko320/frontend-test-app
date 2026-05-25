import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UsersService } from '../../services/users';
import { User } from '../../../../core/models/user';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList implements OnInit {
  private usersService = inject(UsersService);

  users: User[] = [];
  filteredUsers: User[] = [];

  search = '';

  ngOnInit(): void {
    this.usersService.getUsers().subscribe((users) => {
      console.log(users);

      this.users = users;
      this.filteredUsers = users;
    });
  }

  onSearch(): void {
    this.filteredUsers = this.users.filter((user) =>
      user.name.toLowerCase().includes(this.search.toLowerCase())
    );
  }
}