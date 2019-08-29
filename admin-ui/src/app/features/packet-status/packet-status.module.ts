import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacketStatusComponent } from './packet-status/packet-status.component';
import { PacketStatusRoutingModule } from './packet-status-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    PacketStatusRoutingModule,
    SharedModule,
    FormsModule
  ],
  declarations: [PacketStatusComponent]
})
export class PacketStatusModule { }
