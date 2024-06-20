import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { ViewComponent } from './view/view.component';
import { CanDeactivateGuardService } from 'src/app/core/services/can-deactivate-guard.service';
import { RolesGuard } from 'src/app/core/services/roles.guard';


const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  { path: 'view', component: ViewComponent, canActivate: [RolesGuard] },
  { path: 'create', component: CreateComponent, canDeactivate: [CanDeactivateGuardService] },
  { path: 'single-view/:id', component: CreateComponent, canDeactivate: [CanDeactivateGuardService] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MispRoutingModule { }
