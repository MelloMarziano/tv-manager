import { NgModule } from '@angular/core';
import { PrivateModule } from '../../private.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ClientesPage } from './clientes.page';
import { ClientesPageRoutingModule } from './clientes.page-routing.module';

@NgModule({
  imports: [
    ClientesPageRoutingModule,
    PrivateModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [ClientesPage],
})
export class ClientesPageModule {}
