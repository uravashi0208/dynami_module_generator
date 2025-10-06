import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { RoleComponent } from '../uikit/pages/role/role.component';
import { UserComponent } from '../uikit/pages/user/user.component';
import { ModuleComponent } from '../uikit/pages/module/module.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('../dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'role',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: RoleComponent }
    ]
  },
  {
    path: 'user',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: UserComponent }
    ]
  },
  {
    path: 'module',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ModuleComponent }
    ]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'error/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
