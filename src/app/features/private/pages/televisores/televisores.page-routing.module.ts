import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TelevisoresPage } from './televisores.page';

const routes: Routes = [
  {
    path: '',
    component: TelevisoresPage,
  },
  {
    path: ':clienteId',
    component: TelevisoresPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TelevisoresPageRoutingModule {}
