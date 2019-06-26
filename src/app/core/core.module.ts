import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { HomeComponent } from './home/home.component';
import { ParentComponent } from './parent/parent.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { SideMenuService } from './services/side-menu.service';
import { HttpClientModule } from '@angular/common/http';
import { DataStorageService } from './services/data-storage.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    HttpClientModule,
    SharedModule
  ],
  declarations: [HeaderComponent, SideMenuComponent, HomeComponent, ParentComponent],
  exports: [HeaderComponent, SideMenuComponent, HomeComponent, ParentComponent, MaterialModule, RouterModule],
  providers: [SideMenuService, DataStorageService]
})
export class CoreModule { }
