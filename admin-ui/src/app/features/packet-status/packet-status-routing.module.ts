import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PacketStatusComponent } from './packet-status/packet-status.component';
import { RolesGuard } from 'src/app/core/services/roles.guard';


const routes: Routes = [
    { path: '', redirectTo: 'view', pathMatch: 'full' },
    { path: 'view', component: PacketStatusComponent, canActivate: [RolesGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PacketStatusRoutingModule { }
