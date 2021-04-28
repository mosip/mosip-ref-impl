import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MasterDataComponent } from './master-data/master-data.component';
import { ListViewComponent } from './list-view/list-view.component';
import { SingleViewComponent } from './single-view/single-view.component';
import { MasterdataGuard } from 'src/app/core/services/masterdata.guard';
import { MaterDataCommonViewComponent } from './shared/mater-data-common-view/mater-data-common-view.component';
import { DocumentCategoryMappingComponent } from './document-category-mapping/document-category-mapping.component';
import { RolesGuard } from 'src/app/core/services/roles.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: MasterDataComponent, canActivate: [RolesGuard] },
  { path: 'documentCategoryMapping', component: DocumentCategoryMappingComponent, canActivate: [RolesGuard]},
  { path: ':type/view', component: ListViewComponent, canActivate: [RolesGuard, MasterdataGuard] },  
  { path: ':type/create', component: SingleViewComponent, canActivate: [RolesGuard, MasterdataGuard] },
  { path: ':type/single-view/:id', component: SingleViewComponent, canActivate: [RolesGuard, MasterdataGuard] },
  { path: ':type/:dynamicfieldtype/view', component: ListViewComponent},
  { path: ':type/:dynamicfieldtype/create', component: SingleViewComponent},
  { path: ':type/:dynamicfieldtype/single-view/:id', component: SingleViewComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterdataRoutingModule { }
