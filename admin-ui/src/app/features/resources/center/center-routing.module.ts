import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { ViewComponent } from './view/view.component';
import { CanDeactivateGuardService } from 'src/app/core/services/can-deactivate-guard.service';


const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  { path: 'create', component: CreateComponent, canDeactivate: [CanDeactivateGuardService] },
  { path: 'view', component: ViewComponent },
  { path: 'single-view/:id', component: CreateComponent, canDeactivate: [CanDeactivateGuardService] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CenterRoutingModule {}
