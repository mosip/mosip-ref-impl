import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewComponent } from './view/view.component';
import { CanDeactivateGuardService } from 'src/app/core/services/can-deactivate-guard.service';
import { RolesGuard } from 'src/app/core/services/roles.guard';


const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: ViewComponent, canDeactivate: [CanDeactivateGuardService], canActivate: [RolesGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GetcertificateRoutingModule { }
