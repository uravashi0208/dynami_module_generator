import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css'],
  imports: [
    FormsModule, 
    ReactiveFormsModule, 
    RouterLink, 
    AngularSvgIconModule, 
    ButtonComponent,
    NgIf,
    NgClass
  ],
})
export class NewPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  submitted = false;
  loading = false;
  token: string = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = 0;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get token from URL query parameters
    this.token = this._route.snapshot.queryParams['token'] || '';
    
    this.initForm();
    
    // Check if token is present
    if (!this.token) {
      console.error('No reset token found');
      // You can redirect to forgot password page or show an error
    }
  }

  private initForm(): void {
    this.resetForm = this._formBuilder.group({
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword?.setErrors(null);
      return null;
    }
  }

  // Getter for easy access to form controls
  get f() {
    return this.resetForm.controls;
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Toggle confirm password visibility
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Check password strength
  checkPasswordStrength(): void {
    const password = this.resetForm.get('password')?.value || '';
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    this.passwordStrength = strength;
  }

  // Get password strength color
  getPasswordStrengthColor(index: number): string {
    if (this.passwordStrength === 0) return 'bg-muted';
    
    const colors = ['bg-destructive', 'bg-warning', 'bg-warning', 'bg-success', 'bg-success'];
    return index < this.passwordStrength ? colors[this.passwordStrength - 1] : 'bg-muted';
  }

  // Get password strength text
  getPasswordStrengthText(): string {
    const texts = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    return this.passwordStrength > 0 ? texts[this.passwordStrength - 1] : 'Password strength';
  }

  onSubmit(): void {
    this.submitted = true;
    
    // Stop here if form is invalid or no token
    if (this.resetForm.invalid || !this.token) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    
    const { password } = this.resetForm.value;

    this._authService.resetPassword(this.token, password).subscribe({
      next: (message: string) => {
        this.loading = false;
        // Show success message (you can use a toast service)
        console.log('Password reset successful:', message);
        
        // Redirect to login page with success message
        this._router.navigate(['/auth/login'], {
          queryParams: { message: 'password_reset_success' }
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Password reset error:', error);
        
        // Show error message (you can use a toast service)
        // Handle specific errors
        if (error.message.includes('invalid') || error.message.includes('expired')) {
          // Redirect to forgot password page if token is invalid/expired
          this._router.navigate(['/auth/forgot-password'], {
            queryParams: { error: 'invalid_token' }
          });
        }
      }
    });
  }

  // Mark all form controls as touched to trigger validation messages
  private markFormGroupTouched(): void {
    Object.keys(this.resetForm.controls).forEach(key => {
      const control = this.resetForm.get(key);
      control?.markAsTouched();
    });
  }
}