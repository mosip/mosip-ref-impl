import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewComponent } from './view/view.component';
import { CreateComponent } from './create/create.component';
import { UsersHeaderComponent } from './users-header/users-header.component';
import { UsersRoutingModule } from './users-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule
  ],
  declarations: [ViewComponent, CreateComponent, UsersHeaderComponent]
})
export class UsersModule { }
