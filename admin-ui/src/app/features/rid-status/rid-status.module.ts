import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RidStatusComponent } from './rid-status/rid-status.component';
import { RidStatusRoutingModule } from './rid-status-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material.module';

@NgModule({
  imports: [
    CommonModule,
    RidStatusRoutingModule,
    SharedModule,
    FormsModule,
    MaterialModule
  ],
  declarations: [RidStatusComponent]
})
export class RidStatusModule { }
