import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: 'misp', pathMatch: 'full' },  
  { path: 'misp', loadChildren: () => import('../resources/misp/misp.module').then(m => m.MispModule) },
  { path: 'policy', loadChildren: () => import('../resources/policy/policy.module').then(m => m.PolicyModule) },
  { path: 'partner', loadChildren: () => import('../resources/partner/partner.module').then(m => m.PartnerModule) },
  { path: 'pmanager', loadChildren: () => import('../resources/pmanager/pmanager.module').then(m => m.PmanagerModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule { }
