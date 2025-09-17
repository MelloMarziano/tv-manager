import { NgModule } from '@angular/core';
import { PrivateModule } from '../../private.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UsersPage } from './users.page';
import { UsersPageRoutingModule } from './users.page-routing.module';

@NgModule({
  imports: [
    UsersPageRoutingModule,
    PrivateModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [UsersPage],
})
export class UsersPageModule {}
