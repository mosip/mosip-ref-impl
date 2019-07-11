import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MasterDataComponent } from './master-data/master-data.component';
import { MaterDataCommonViewComponent } from './shared/mater-data-common-view/mater-data-common-view.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: MasterDataComponent },
  { path: 'masterDataView', component: MaterDataCommonViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterdataRoutingModule { }
