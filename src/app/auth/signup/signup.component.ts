import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['../auth.styles.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      passwords: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      }, { validators: this.passwordsMatch })
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
      const formData = {
        name: this.signupForm.value.name,
        email: this.signupForm.value.email,
        password: this.signupForm.value.passwords.password
      };
      
      console.log(formData);
      // Registration logic would go here
    }
  }

  // Helper getters for template access
  get name() { return this.signupForm.get('name'); }
  get email() { return this.signupForm.get('email'); }
  get passwordsGroup() { return this.signupForm.get('passwords') as FormGroup; }
  get password() { return this.passwordsGroup.get('password'); }
  get confirmPassword() { return this.passwordsGroup.get('confirmPassword'); }
}
