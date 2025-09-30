import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { NewPasswordComponent } from './pages/new-password/new-password.component';
import { TwoStepsComponent } from './pages/two-steps/two-steps.component';
import { GuestGuard } from 'src/app/core/guards/guest.guard';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

const routes: Routes = [
  {
      path: 'login',
      component: AuthComponent,
      canActivate: [GuestGuard],
      children: [
        { path: '', component: LoginComponent }
      ]
    },
    {
      path: 'register',
      component: AuthComponent,
      canActivate: [GuestGuard],
      children: [
        { path: '', component: RegisterComponent }
      ]
    },
    {
      path: 'forgot-password',
      component: AuthComponent,
      canActivate: [GuestGuard],
      children: [
        { path: '', component: ForgotPasswordComponent }
      ]
    },
    {
      path: 'new-password',
      component: AuthComponent,
      canActivate: [GuestGuard],
      children: [
        { path: '', component: NewPasswordComponent }
      ]
    },
    {
      path: 'two-steps',
      component: AuthComponent,
      canActivate: [GuestGuard],
      children: [
        { path: '', component: TwoStepsComponent }
      ]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
