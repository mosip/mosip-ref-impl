import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: 'masterdataupload', pathMatch: 'full' },
  { path: 'masterdataupload', loadChildren: () => import('../bulkupload/masterdataupload/masterdataupload.module').then(m => m.MasterdatauploadModule)},
  { path: 'packetupload', loadChildren: () => import('../bulkupload/packetdataupload/packetupload.module').then(m => m.PacketuploadModule)},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BulkuploadRoutingModule { }
