import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ParentComponent } from './core/parent/parent.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { HomeComponent } from './core/home/home.component';
import { ErrorComponent } from './shared/error/error.component';
import { AuthguardService } from './core/services/authguard.service';
import { LanguageGuard } from './core/services/LanguageGuard';

const routes: Routes = [
  { path: '', redirectTo: 'admin', pathMatch: 'full'},
  {
    path: 'admin',
    component: ParentComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      {
        path: 'resources',
        loadChildren: () =>
          import('./features/resources/resources.module').then(
            m => m.ResourcesModule
          )
      },
      {
        path: 'masterdata',
        loadChildren: () =>
          import('./features/masterdata/masterdata.module').then(
            m => m.MasterdataModule
          )
      },
      {
        path: 'packet-status',
        loadChildren: () =>
          import('./features/packet-status/packet-status.module').then(
            m => m.PacketStatusModule
          )
      },
      {
        path: 'bulkupload',
        loadChildren: () =>
          import('./features/bulkupload/bulkupload.module').then(
            m => m.BulkuploadModule
          )
      },
      {
        path: 'keymanager',
        loadChildren: () =>
          import('./features/keymanager/keymanager.module').then(
            m => m.KeymanagerModule
          )
      }
    ], canActivateChild : [AuthguardService] , canActivate: [LanguageGuard]
  },
  { path: 'error', component: ErrorComponent },
  { path: '**', component: NotFoundComponent },
  { path: '404', component: NotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      preloadingStrategy: PreloadAllModules,
      enableTracing: false,
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
