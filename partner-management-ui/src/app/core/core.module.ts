import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { HomeComponent } from './home/home.component';
import { ParentComponent } from './parent/parent.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { SideMenuService } from './services/side-menu.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DataStorageService } from './services/data-storage.service';
import { SharedModule } from '../shared/shared.module';
import { AuthService } from './services/authservice.service';
import { LoginRedirectService } from './services/loginredirect.service';
import { AuthguardService } from './services/authguard.service';
import { CanDeactivateGuardService } from './services/can-deactivate-guard.service';
import { AuthInterceptor } from './services/httpinterceptor';
import { CommonService } from './services/common.service';
import { AuditService } from './services/audit.service';
import { RolesService } from './services/roles.service';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    HttpClientModule,
    SharedModule,
  ],
  declarations: [HeaderComponent, SideMenuComponent, HomeComponent, ParentComponent],
  exports: [HeaderComponent, SideMenuComponent, HomeComponent, ParentComponent, MaterialModule, RouterModule],
  providers: [SideMenuService, DataStorageService, AuthService, LoginRedirectService, AuthguardService,
    CanDeactivateGuardService, CommonService, AuditService, RolesService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class CoreModule { }
