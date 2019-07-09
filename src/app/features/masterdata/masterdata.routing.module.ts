import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MasterDataComponent } from './master-data/master-data.component';

const routes: Routes = [
    { path: '', redirectTo: 'masterdata', pathMatch: 'full' },
    { path: 'masterdata', component: MasterDataComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class MasterRoutingModule { }
