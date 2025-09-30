import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { BehaviorSubject, Observable, map, tap, catchError, throwError, take } from 'rxjs';
import { Router } from '@angular/router';
// import { ToastrService } from 'ngx-toastr'; 

// #region GraphQL Types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginResponse {
  login: {
    token: string;
    user: User;
  };
}

export interface RegisterResponse {
  register: {
    token: string;
    user: User;
  };
}

interface ForgotPasswordResponse {
  forgotPassword: {
    message: string;
  };
}

interface ResetPasswordResponse {
  resetPassword: {
    message: string;
  };
}
// #endregion

// #region GraphQL Operations
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        first_name
        last_name
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: CreateUserInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        first_name
        last_name
      }
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      first_name
      last_name
    }
  }
`;

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      message
    }
  }
`;

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password) {
      message
    }
  }
`;
// #endregion

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private authLoadingSubject = new BehaviorSubject<boolean>(true);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));
  public authLoading$ = this.authLoadingSubject.asObservable();

  constructor(
    private apollo: Apollo,
    private router: Router,
    // private toastr: ToastrService,
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.tokenSubject.next(token);
      this.getCurrentUser().subscribe({
        next: () => {
          this.authLoadingSubject.next(false);
        },
        error: () => {
          this.authLoadingSubject.next(false);
          this.logout();
        }
      });
    } else {
      this.authLoadingSubject.next(false);
    }
  }

  login(email: string, password: string): Observable<User> {
    const input = {
      email,
      password
    };

    return this.apollo.mutate<LoginResponse>({
      mutation: LOGIN_MUTATION,
      variables: { input }
    }).pipe(
      map(result => result.data!.login),
      tap(loginData => {
        localStorage.setItem('auth_token', loginData.token);
        this.tokenSubject.next(loginData.token);
        this.currentUserSubject.next(loginData.user);
        // this.toastr.success('Login successful!', 'Success');
      }),
      map(loginData => loginData.user),
      catchError(error => {
        console.error('Login error:', error);
        const errorMessage = error.message || 'Login failed. Please try again.';
        // this.toastr.error(errorMessage, 'Error');
        return throwError(() => error);
      })
    );
  }

  register(first_name: string, last_name: string, email: string, password: string): Observable<User> {
    const input = {
      first_name: first_name || '',
      last_name: last_name || '',
      email,
      password,
      roleIds: ['68da990220e12d5a35c25c28']
    };

    return this.apollo.mutate<RegisterResponse>({
      mutation: REGISTER_MUTATION,
      variables: { input }
    }).pipe(
      map(result => result.data!.register),
      tap(registerData => {
        localStorage.setItem('auth_token', registerData.token);
        this.tokenSubject.next(registerData.token);
        this.currentUserSubject.next(registerData.user);
        // this.toastr.success('Registration successful!', 'Success');
      }),
      map(registerData => registerData.user),
      catchError(error => {
        console.error('Registration error:', error);
        const errorMessage = error.message || 'Registration failed. Please try again.';
        // this.toastr.error(errorMessage, 'Error');
        return throwError(() => error);
      })
    );
  }

  requestPasswordReset(email: string): Observable<string> {
    return this.apollo.mutate<ForgotPasswordResponse>({
      mutation: FORGOT_PASSWORD_MUTATION,
      variables: { email }
    }).pipe(
      map(result => result.data!.forgotPassword.message),
      catchError(error => {
        console.error('Forgot password error:', error);
        return throwError(() => error);
      })
    );
  }

  resetPassword(token: string, password: string): Observable<string> {
    return this.apollo.mutate<ResetPasswordResponse>({
      mutation: RESET_PASSWORD_MUTATION,
      variables: { token, password }
    }).pipe(
      map(result => result.data!.resetPassword.message),
      catchError(error => {
        console.error('Reset password error:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.apollo.query<{ me: User }>({
      query: ME_QUERY,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.me),
      tap(user => this.currentUserSubject.next(user)),
      catchError(error => {
        console.error('Get current user error:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.apollo.client.clearStore();
    this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return this.tokenSubject.value || localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  redirectBasedOnAuth(): void {
    this.isAuthenticated$.pipe(take(1)).subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}