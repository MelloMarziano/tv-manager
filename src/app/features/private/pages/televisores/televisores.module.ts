import { NgModule } from '@angular/core';
import { PrivateModule } from '../../private.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TelevisoresPageRoutingModule } from './televisores.page-routing.module';
import { TelevisoresPage } from './televisores.page';

@NgModule({
  imports: [
    TelevisoresPageRoutingModule,
    PrivateModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [TelevisoresPage],
})
export class TelevisoresPageModule {}
