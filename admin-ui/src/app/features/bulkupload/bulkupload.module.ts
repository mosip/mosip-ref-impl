import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkuploadRoutingModule } from './bulkupload-routing.module';
import { MaterialModule } from 'src/app/shared/material.module';
import { I18nModule } from 'src/app/i18n.module';

@NgModule({
  imports: [
    CommonModule,
    BulkuploadRoutingModule,
    MaterialModule,
    I18nModule,
  ],
  declarations: []
})
export class BulkuploadModule { }
