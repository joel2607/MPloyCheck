import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface AuthResponse {
  token: string;
  user: {
    email: string;
    name: string;
    role: string;
  }
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['../../global.styles.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      passwords: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      }, { validators: this.passwordsMatch },),
      role: ['general', Validators.required]
    });
  }

  // Custom validator to check if passwords match
  passwordsMatch(group: FormGroup): {[key: string]: any} | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { passwordsNotMatch: true };
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.http.post<AuthResponse>('http://localhost:8000/auth/register', {
        email: this.signupForm.value.email,
        password: this.signupForm.value.confirmPassword,
        name: this.signupForm.value.name,
        role: this.signupForm.value.role
      }).subscribe({
        next: (response) => {
          // Store JWT token and user details
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Navigate to home
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 400) {
            this.errorMessage = 'Email already exists.';
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
          }
          console.error('Login error:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  // Helper getters for template access
  get name() { return this.signupForm.get('name'); }
  get email() { return this.signupForm.get('email'); }
  get passwordsGroup() { return this.signupForm.get('passwords') as FormGroup; }
  get password() { return this.passwordsGroup.get('password'); }
  get confirmPassword() { return this.passwordsGroup.get('confirmPassword'); }
}
