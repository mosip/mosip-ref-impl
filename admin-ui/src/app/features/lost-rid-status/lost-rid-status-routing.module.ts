import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LostRidStatusComponent } from './lost-rid-status/lost-rid-status.component';
import { RolesGuard } from 'src/app/core/services/roles.guard';


const routes: Routes = [
    { path: '', redirectTo: 'view', pathMatch: 'full' },
    { path: 'view', component: LostRidStatusComponent, canActivate: [RolesGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LostRidStatusRoutingModule { }
