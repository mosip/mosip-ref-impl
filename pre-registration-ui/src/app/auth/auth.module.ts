import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from '../app-routing.module';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { FooterComponent } from '../core/footer/footer.component';

@NgModule({
  declarations: [LoginComponent],
  imports: [FormsModule, CommonModule, ReactiveFormsModule, AuthRoutingModule, AppRoutingModule, SharedModule , CoreModule]
})
export class AuthModule {}
