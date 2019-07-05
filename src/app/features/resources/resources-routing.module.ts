import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: 'centers', pathMatch: 'full' },
  { path: 'centers', loadChildren: './center/center.module#CenterModule' },
 { path: 'devices', loadChildren: './devices/devices.module#DevicesModule' },
 { path: 'machines', loadChildren: './machines/machines.module#MachinesModule' },
//  { path: 'users', loadChildren: './users/users.module.#UsersModule' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule {}
