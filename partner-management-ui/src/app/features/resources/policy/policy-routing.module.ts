import { ViewComponent } from "./view/view.component";
import { CreateComponent } from './create/create.component';
import { RolesGuard } from 'src/app/core/services/roles.guard';
import { CanDeactivateGuardService } from 'src/app/core/services/can-deactivate-guard.service';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthComponent } from './auth/auth.component';

const routes: Routes = [
    { path: '', redirectTo: 'view', pathMatch: 'full' },
    { path: 'view', component: ViewComponent, canActivate: [RolesGuard] },
    { path: 'create', component: CreateComponent, canDeactivate: [CanDeactivateGuardService] },
    { path: 'single-view/:id', component: CreateComponent, canDeactivate: [CanDeactivateGuardService] },
    {path: 'auth-view/:id', component: AuthComponent, canDeactivate: [CanDeactivateGuardService] }
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]   
  })
  export class PolicyRoutingModule{}