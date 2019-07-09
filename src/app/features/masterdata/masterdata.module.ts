import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterdataRoutingModule } from './masterdata-routing.module';
import { MasterDataComponent } from './master-data/master-data.component';

@NgModule({
  declarations: [MasterDataComponent],
  imports: [
    CommonModule,
    MasterdataRoutingModule
  ]
})
export class MasterdataModule { }
