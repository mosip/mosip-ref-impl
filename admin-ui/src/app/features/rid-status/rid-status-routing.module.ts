import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RidStatusComponent } from './rid-status/rid-status.component';
import { RolesGuard } from 'src/app/core/services/roles.guard';


const routes: Routes = [
    { path: '', redirectTo: 'view', pathMatch: 'full' },
    { path: 'view', component: RidStatusComponent, canActivate: [RolesGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RidStatusRoutingModule { }
