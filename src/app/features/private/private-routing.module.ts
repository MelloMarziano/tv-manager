import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrivatePage } from './private.page';
import { roleGuard } from 'src/app/core/guards/role/role.guard';
// import { RoleGuard } from 'src/app/core/guards/role/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: PrivatePage,
    children: [
      {
        path: 'dashboard',
        // canActivate: [roleGuard],
        // data: { roles: ['Admin', 'User'] },
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then(
            (m) => m.DashboardPageModule
          ),
      },
      {
        path: 'clientes',
        // canActivate: [roleGuard],
        // data: { roles: ['Admin', 'User'] },
        loadChildren: () =>
          import('./pages/clientes/clientes.module').then(
            (m) => m.ClientesPageModule
          ),
      },
      {
        path: 'televisores',
        // canActivate: [roleGuard],
        // data: { roles: ['Admin', 'User'] },
        loadChildren: () =>
          import('./pages/televisores/televisores.module').then(
            (m) => m.TelevisoresPageModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivateRoutingModule {}
