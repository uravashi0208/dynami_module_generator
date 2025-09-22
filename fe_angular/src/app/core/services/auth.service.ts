import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { BehaviorSubject, Observable, map, tap, catchError, throwError, take } from 'rxjs';
import { Router } from '@angular/router';
// import { ToastrService } from 'ngx-toastr'; 

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
  createUser: {
    token: string;
    user: User;
  };
}

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


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private authLoadingSubject = new BehaviorSubject<boolean>(true); 
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));
  public authLoading$ = this.authLoadingSubject.asObservable(); // Add loading observable

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
        next: (user) => {
          this.authLoadingSubject.next(false); // Loading complete
        },
        error: (error) => {
          this.authLoadingSubject.next(false); // Loading complete even on error
          this.logout();
        }
      });
    } else {
      this.authLoadingSubject.next(false); // No token, loading complete
    }
  }

  login(email: string, password: string): Observable<User> {
  const input = {
    email,
    password
  };

  return this.apollo.mutate<LoginResponse>({
    mutation: LOGIN_MUTATION,
    variables: { input } // Pass as input object
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
        // this.toastr.error(errorMessage, 'Error'); // Error toast
        return throwError(() => error);
      })
    );
  }

  register(email: string, password: string, first_name?: string, last_name?: string): Observable<User> {
    const input = {
        email,
        password,
        first_name: first_name || '',
        last_name: last_name || '',
        roleIds: ['68cad59db5beb339ed799925'] // Add empty array or appropriate role IDs
      };


    return this.apollo.mutate<{register: {token: string, user: User}}>({
      mutation: REGISTER_MUTATION,
      variables: { input }
    }).pipe(
      map(result => result.data!.register),
      tap(registerData => {
        localStorage.setItem('auth_token', registerData.token);
        this.tokenSubject.next(registerData.token);
        this.currentUserSubject.next(registerData.user);
        // this.toastr.success('Registration successful!', 'Success'); // Success toast
      }),
      map(registerData => registerData.user),
      catchError(error => {
        console.error('Registration error:', error);
        const errorMessage = error.message || 'Registration failed. Please try again.';
        // this.toastr.error(errorMessage, 'Error'); // Error toast
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