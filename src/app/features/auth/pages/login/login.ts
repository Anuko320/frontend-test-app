import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  login = '';
  password = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (this.login === 'admin' && this.password === 'admin') {
      this.router.navigate(['/users']);
    } else {
      alert('Invalid credentials');
    }
  }
}