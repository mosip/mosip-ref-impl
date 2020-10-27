import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: 'generatecsr', pathMatch: 'full' },
  { path: 'generatecsr', loadChildren: () => import('../keymanager/generatecsr/generatecsr.module').then(m => m.GeneratecsrModule) },
  { path: 'generatemasterkey', loadChildren: () => import('../keymanager/generatemasterkey/generatemasterkey.module').then(m => m.GeneratemasterkeyModule) },
  { path: 'uploadcertificate', loadChildren: () => import('../keymanager/uploadcertificate/uploadcertificate.module').then(m => m.UploadcertificateModule) },
  { path: 'uploadotherdomaincertificate', loadChildren: () => import('../keymanager/uploadotherdomaincertificate/uploadotherdomaincertificate.module').then(m => m.UploadotherdomaincertificateModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KeymanagerRoutingModule { }
