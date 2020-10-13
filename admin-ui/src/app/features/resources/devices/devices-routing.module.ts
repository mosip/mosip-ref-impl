import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { ViewComponent } from './view/view.component';
import { MapcenterComponent } from './mapcenter/mapcenter.component';
import { RolesGuard } from 'src/app/core/services/roles.guard';


const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  { path: 'view', component: ViewComponent, canActivate: [RolesGuard] },
  { path: 'create', component: CreateComponent, canActivate: [RolesGuard] },
  { path: 'single-view/:id', component: CreateComponent, canActivate: [RolesGuard] },
  { path: 'map-center/:id', component: MapcenterComponent, canActivate: [RolesGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevicesRoutingModule {}
