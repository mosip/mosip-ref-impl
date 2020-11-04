import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewComponent } from './view/view.component';
import { CreateComponent } from './create/create.component';
import { MapcenterComponent } from './mapcenter/mapcenter.component';
import { MachinesRoutingModule } from './machines-routing.module';
import { MaterialModule } from 'src/app/shared/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MachinesHeaderComponent } from './machines-header/machines-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StatusPipe } from 'src/app/shared/pipes/status.pipe';
import { MatKeyboardModule } from 'ngx7-material-keyboard';

@NgModule({
  imports: [
    CommonModule,
    MachinesRoutingModule,
    MaterialModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatKeyboardModule
  ],
  declarations: [ViewComponent, CreateComponent, MachinesHeaderComponent, MapcenterComponent],
  providers: [StatusPipe]
})
export class MachinesModule { }
