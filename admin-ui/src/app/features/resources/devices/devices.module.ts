import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateComponent } from './create/create.component';
import { ViewComponent } from './view/view.component';
import { MapcenterComponent } from './mapcenter/mapcenter.component';
import { DevicesRoutingModule } from './devices-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/material.module';
import { DevicesHeaderComponent } from './devices-header/devices-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StatusPipe } from 'src/app/shared/pipes/status.pipe';
import { MatKeyboardModule } from 'ngx7-material-keyboard';


@NgModule({
  imports: [
    CommonModule,
    DevicesRoutingModule,
    SharedModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatKeyboardModule
  ],
  declarations: [CreateComponent, ViewComponent, DevicesHeaderComponent, MapcenterComponent],
  providers: [StatusPipe]
})
export class DevicesModule { }
