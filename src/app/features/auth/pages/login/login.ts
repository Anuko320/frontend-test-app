import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  login = '';
  password = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    const isValid = this.authService.login(
      this.login,
      this.password
    );

    if (isValid) {
      this.router.navigate(['/users']);
    } else {
      alert('Invalid credentials');
    }
  }
}