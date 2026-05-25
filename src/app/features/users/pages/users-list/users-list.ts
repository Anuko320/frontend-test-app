import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersService } from '../../services/users';
import { User } from '../../../../core/models/user';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList implements OnInit {
  private usersService = inject(UsersService);

  users: User[] = [];

  ngOnInit(): void {
  this.usersService.getUsers().subscribe((users) => {
    console.log(users);

    this.users = users;
  });
  }
}