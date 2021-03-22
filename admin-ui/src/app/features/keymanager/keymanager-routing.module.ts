import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: 'generatecsr', pathMatch: 'full' },
  { path: 'generatecsr', loadChildren: () => import('../keymanager/generateCSR/generatecsr.module').then(m => m.GeneratecsrModule) },
  { path: 'generatemasterkey', loadChildren: () => import('../keymanager/generateMasterKey/generatemasterkey.module').then(m => m.GeneratemasterkeyModule) },
  { path: 'getcertificate', loadChildren: () => import('../keymanager/getCertificate/getcertificate.module').then(m => m.GetcertificateModule) },
  { path: 'uploadcertificate', loadChildren: () => import('../keymanager/uploadCertificate/uploadcertificate.module').then(m => m.UploadcertificateModule) },
  { path: 'uploadotherdomaincertificate', loadChildren: () => import('../keymanager/uploadOtherDomainCertificate/uploadotherdomaincertificate.module').then(m => m.UploadotherdomaincertificateModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KeymanagerRoutingModule { }
