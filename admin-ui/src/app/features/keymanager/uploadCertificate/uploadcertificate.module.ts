import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateComponent } from './create/create.component';
import { UploadcertificateRoutingModule } from './uploadcertificate-routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from 'src/app/shared/material.module';
import { I18nModule } from '../../../../app/i18n.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatKeyboardModule } from 'ngx7-material-keyboard';


@NgModule({
  imports: [
    CommonModule,
    UploadcertificateRoutingModule,
    SharedModule,
    MaterialModule,
    I18nModule,
    ReactiveFormsModule,
    FormsModule,
    MatKeyboardModule
  ],
  declarations: [CreateComponent]
})
export class UploadcertificateModule { }
