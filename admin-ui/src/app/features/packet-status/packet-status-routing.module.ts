import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PacketStatusComponent } from './packet-status/packet-status.component';


const routes: Routes = [
    { path: '', redirectTo: 'view', pathMatch: 'full' },
    { path: 'view', component: PacketStatusComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PacketStatusRoutingModule { }
