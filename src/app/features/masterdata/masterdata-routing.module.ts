import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MasterDataComponent } from './master-data/master-data.component';
import { ListViewComponent } from './list-view/list-view.component';
import { SingleViewComponent } from './single-view/single-view.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: MasterDataComponent },
  { path: 'document-type/view', component: ListViewComponent },
  { path: 'document-type/single-view/:id', component: SingleViewComponent },
  { path: 'location/view', component: ListViewComponent },
  { path: 'location/single-view/:id', component: SingleViewComponent },
  { path: 'gender-type/view' , component: ListViewComponent},
  { path: 'individual-type/view' , component: ListViewComponent},
  { path: 'center-type/view' , component: ListViewComponent},
  { path: 'machine-type/view' , component: ListViewComponent},
  { path: 'templates/view' , component: ListViewComponent},
  { path: 'title/view' , component: ListViewComponent},
  { path: 'blacklisted-words/view' , component: ListViewComponent}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterdataRoutingModule { }
