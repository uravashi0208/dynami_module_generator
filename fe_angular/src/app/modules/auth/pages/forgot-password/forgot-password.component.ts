import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [FormsModule, ReactiveFormsModule, RouterLink, NgIf, ButtonComponent, NgClass],
})
export class ForgotPasswordComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  loading = false;
  returnUrl = '';
  constructor(private readonly _formBuilder: FormBuilder, private readonly _router: Router,  private authService: AuthService,private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Redirect if already logged in
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this._router.navigate([this.returnUrl]);
      }
    });
  }
  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
  this.loading = true;
  const { email } = this.form.value;

  if (this.form.invalid) {
    this.loading = false;
    return;
  }

  this.authService.requestPasswordReset(email).subscribe({
    next: (message: string) => {
      // Show success message
      // this.toastr.success(message, 'Success');
      console.log('Password reset email sent:', message);
      
      // Redirect to login page with success message
      this._router.navigate(['/auth/login'], { 
        queryParams: { message: 'password_reset_sent' } 
      });
    },
    error: (error) => {
      this.loading = false;
      // Show error message
      // this.toastr.error('Failed to send reset email', 'Error');
      console.error('Password reset error:', error);
    }
  });
  }
}
