import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewComponent } from './view/view.component';
import { CreateComponent } from './create/create.component';
import { MachinesRoutingModule } from './machines-routing.module';
import { MaterialModule } from 'src/app/shared/material.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    MachinesRoutingModule,
    MaterialModule,
    SharedModule
  ],
  declarations: [ViewComponent, CreateComponent]
})
export class MachinesModule { }
