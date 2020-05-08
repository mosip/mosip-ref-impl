import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DynamicuiRoutingModule } from './dynamicui-routing.module';
import { DynamicuiComponent } from './dynamicui/dynamicui.component';

@NgModule({
  declarations: [DynamicuiComponent],
  imports: [
    CommonModule,
    DynamicuiRoutingModule
  ]
})
export class DynamicuiModule { }
