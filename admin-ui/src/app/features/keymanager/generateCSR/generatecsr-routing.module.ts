import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { CanDeactivateGuardService } from 'src/app/core/services/can-deactivate-guard.service';
import { RolesGuard } from 'src/app/core/services/roles.guard';


const routes: Routes = [
  { path: '', redirectTo: 'create', pathMatch: 'full' },
  { path: 'create', component: CreateComponent, canDeactivate: [CanDeactivateGuardService] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneratecsrRoutingModule { }
