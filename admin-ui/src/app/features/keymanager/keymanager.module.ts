import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeymanagerRoutingModule } from './keymanager-routing.module';
import { MaterialModule } from 'src/app/shared/material.module';
import { I18nModule } from 'src/app/i18n.module';

@NgModule({
  imports: [
    CommonModule,
    KeymanagerRoutingModule,
    MaterialModule,
    I18nModule,
  ],
  declarations: []
})
export class KeymanagerModule { }
