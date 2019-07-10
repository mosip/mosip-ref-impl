import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateComponent } from './create/create.component';
import { ViewComponent } from './view/view.component';
import { DevicesRoutingModule } from './devices-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/material.module';

@NgModule({
  imports: [
    CommonModule,
    DevicesRoutingModule,
    SharedModule,
    MaterialModule
  ],
  declarations: [CreateComponent, ViewComponent]
})
export class DevicesModule { }
