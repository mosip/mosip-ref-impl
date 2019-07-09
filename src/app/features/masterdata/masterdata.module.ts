import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterRoutingModule } from './masterdata.routing.module';
import { MasterDataComponent } from './master-data/master-data.component';

@NgModule({
  imports: [
    CommonModule,
    MasterRoutingModule
  ],
  declarations: [MasterDataComponent]
})
export class MasterdataModule { }
