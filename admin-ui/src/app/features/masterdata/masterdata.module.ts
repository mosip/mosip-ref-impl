import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterdataRoutingModule } from './masterdata-routing.module';
import { MasterDataComponent } from './master-data/master-data.component';
import { MaterDataCommonHeaderComponent } from './shared/mater-data-common-header/mater-data-common-header.component';
import { MaterDataCommonBodyComponent } from './shared/mater-data-common-body/mater-data-common-body.component';
import { MaterDataCommonViewComponent } from './shared/mater-data-common-view/mater-data-common-view.component';
import { MaterialModule } from 'src/app/shared/material.module';
import { I18nModule } from '../../../app/i18n.module';
import { ListViewComponent } from './list-view/list-view.component';
import { SingleViewComponent } from './single-view/single-view.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DocumentCategoryMappingComponent } from './document-category-mapping/document-category-mapping.component';
import { MatKeyboardModule } from 'ngx7-material-keyboard';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    MasterDataComponent,
    MaterDataCommonHeaderComponent,
    MaterDataCommonBodyComponent,
    MaterDataCommonViewComponent,
    ListViewComponent,
    SingleViewComponent,
    DocumentCategoryMappingComponent
  ],
  imports: [
    CommonModule,
    MasterdataRoutingModule,
    MaterialModule,
    I18nModule,
    SharedModule,
    MatKeyboardModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class MasterdataModule { }
