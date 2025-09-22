import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AuthService } from 'src/app/core/services/auth.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  imports: [FormsModule, AngularSvgIconModule, ButtonComponent,ReactiveFormsModule, NgIf, NgClass],
})
export class SignUpComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  passwordTextType!: boolean;
  loading = false;
   returnUrl = '';
  constructor(private readonly _formBuilder: FormBuilder, private readonly _router: Router,  private authService: AuthService,private route: ActivatedRoute) {}

  ngOnInit(): void {

    this.form = this._formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Redirect if already logged in
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this._router.navigate(['/dashboard']);
      }
    });

  }

  get f() {
    return this.form.controls;
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

   onSubmit() {
    this.submitted = true;
    this.loading = true;
    const { first_name, last_name, email, password } = this.form.value;

    if (this.form.invalid) {
      this.loading = false;
      return;
    }

    this.authService.register(email, password, first_name, last_name).subscribe({
      next: () => {
        this._router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
    // alert("Enter Credentials")
  }
}
