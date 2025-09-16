import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { PrivatePage } from './private.page';
import { CommonModule } from '@angular/common';
import { PrivateRoutingModule } from './private-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModuleCustom } from 'src/app/material/material.module';
import { MatTooltipModule } from '@angular/material/tooltip';
// import { LucideAngularModule } from 'lucide-angular';
// import { icons } from 'lucide';
import { AppbarComponent } from './components/appbar/appbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

// const lucideIcons = Object.keys(icons).reduce((acc, key) => {
//   acc[key] = (icons as any)[key];
//   return acc;
// }, {} as any);


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PrivateRoutingModule,
    // LucideAngularModule.pick(lucideIcons),
  ],
  declarations: [
    PrivatePage,
    AppbarComponent,
    SidebarComponent
  ],
  exports: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class PrivateModule { }