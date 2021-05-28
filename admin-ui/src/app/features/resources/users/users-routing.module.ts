import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewComponent } from './view/view.component';
import { CreateComponent } from './create/create.component';
import { RolesGuard } from 'src/app/core/services/roles.guard';


const routes: Routes = [
    { path: '', redirectTo: 'view', pathMatch: 'full' },
    { path: 'view', component: ViewComponent, canActivate: [RolesGuard] },
    { path: 'single-view/:id', component: CreateComponent, canActivate: [RolesGuard] },
    { path: 'map', component: CreateComponent, canActivate: [RolesGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
