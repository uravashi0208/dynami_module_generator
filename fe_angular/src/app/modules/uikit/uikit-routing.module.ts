import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UikitComponent } from './uikit.component';
import { RoleComponent } from './pages/role/role.component';
import { UserComponent } from './pages/user/user.component';
import { ModuleComponent } from './pages/module/module.component';
import { TestingComponent } from './pages/testing/testing.component';

const routes: Routes = [
  {
    path: '',
    component: UikitComponent,
    children: [
      { path: '', redirectTo: '', pathMatch: 'full' },
      { path: 'role', component: RoleComponent },
      { path: 'user', component: UserComponent },
      { path: 'module', component: ModuleComponent },
      
      { path: 'testing', component: TestingComponent },{ path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UikitRoutingModule {}
