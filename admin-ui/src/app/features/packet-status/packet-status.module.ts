import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacketStatusComponent } from './packet-status/packet-status.component';
import { PacketStatusRoutingModule } from './packet-status-routing.module';

@NgModule({
  imports: [
    CommonModule,
    PacketStatusRoutingModule
  ],
  declarations: [PacketStatusComponent]
})
export class PacketStatusModule { }
