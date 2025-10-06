import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, SignupRequest } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  firstName = '';
  lastName = '';
  gender = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Basic validation
    if (!this.firstName || !this.lastName || !this.gender || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all required fields';
      this.isLoading = false;
      return;
    }

    // Validate passwords match
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.isLoading = false;
      return;
    }

    // Validate password length
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      this.isLoading = false;
      return;
    }

    // Validate gender selection
    if (!this.gender || (this.gender !== 'M' && this.gender !== 'F')) {
      this.errorMessage = 'Please select a valid gender';
      this.isLoading = false;
      return;
    }

    // Create signup request
    const signupRequest: SignupRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword
    };

    // Call the auth service to signup via API
    this.authService.signup(signupRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Please check your email for verification.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Signup error:', error);
        
        // Handle different types of errors
        if (error.status === 409) {
          this.errorMessage = 'Email already exists. Please use a different email address.';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Invalid data provided. Please check your information.';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your connection.';
        } else if (error.status >= 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = error.error?.message || 'An unexpected error occurred. Please try again.';
        }
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}