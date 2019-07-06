import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ParentComponent } from './core/parent/parent.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { HomeComponent } from './core/home/home.component';
import { AuthguardService } from './core/services/authguard.service';
import { ErrorComponent } from './shared/error/error.component';

const routes: Routes = [
  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  {
    path: 'admin',
    component: ParentComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'resources', loadChildren: () => import('./features/resources/resources.module').then(m => m.ResourcesModule) }
    ], canActivateChild : [AuthguardService]
    },
  { path: 'error', component: ErrorComponent },
  { path: '**', component: NotFoundComponent },
  { path: '404', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true, preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
