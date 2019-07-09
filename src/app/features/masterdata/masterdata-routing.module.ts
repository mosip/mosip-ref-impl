import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MasterDataComponent } from './master-data/master-data.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: MasterDataComponent, children: [] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterdataRoutingModule { }
