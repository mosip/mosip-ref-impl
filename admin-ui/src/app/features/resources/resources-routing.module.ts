import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: 'centers', pathMatch: 'full' },
  { path: 'centers', loadChildren: () => import('../resources/center/center.module').then(m => m.CenterModule) },
  { path: 'devices', loadChildren: () => import('../resources/devices/devices.module').then(m => m.DevicesModule) },
  { path: 'machines', loadChildren: () => import('../resources/machines/machines.module').then(m => m.MachinesModule) },
  { path: 'zoneuser', loadChildren: () => import('../resources/users/users.module').then(m => m.UsersModule) },
  { path: 'users', loadChildren: () => import('../resources/users/users.module').then(m => m.UsersModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule { }
