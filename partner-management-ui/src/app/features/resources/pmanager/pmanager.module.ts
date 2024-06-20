import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StatusPipe } from 'src/app/shared/pipes/status.pipe';
import { PmanagerRoutingModule } from './pmanager-routing.module';
import { PmanagerHeaderComponent} from './pmanager-header/pmanager-header.component';
import { ViewComponent } from './view/view.component';
import { CreateComponent} from './create/create.component';

@NgModule({
  imports: [
    CommonModule,
    PmanagerRoutingModule,
    SharedModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [CreateComponent,ViewComponent,PmanagerHeaderComponent],
  providers: [StatusPipe]
})
export class PmanagerModule { }
