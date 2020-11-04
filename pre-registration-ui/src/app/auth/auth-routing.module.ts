import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DefaultLangGuardService } from './default-lang-guard.service';

const authRoutes: Routes = [{ path: '', redirectTo : 'eng', pathMatch: 'full' },
{ path: ':lang', component: LoginComponent, canActivate:[DefaultLangGuardService]}];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
