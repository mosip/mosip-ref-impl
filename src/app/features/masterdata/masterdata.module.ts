import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterdataRoutingModule } from './masterdata-routing.module';
import { MasterDataComponent } from './master-data/master-data.component';
import { MaterDataCommonHeaderComponent } from './shared/mater-data-common-header/mater-data-common-header.component';
import { MaterDataCommonBodyComponent } from './shared/mater-data-common-body/mater-data-common-body.component';
import { MaterDataCommonViewComponent } from './shared/mater-data-common-view/mater-data-common-view.component';
import { MaterialModule } from 'src/app/shared/material.module';
import { I18nModule } from '../../../app/i18n.module';

@NgModule({
  declarations: [MasterDataComponent, MaterDataCommonHeaderComponent, MaterDataCommonBodyComponent, MaterDataCommonViewComponent],
  imports: [
    CommonModule,
    MasterdataRoutingModule,
    MaterialModule,
    I18nModule
  ]
})
export class MasterdataModule { }
