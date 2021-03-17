import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatKeyboardModule } from 'ngx7-material-keyboard';

import { DemographicRoutingModule } from './demographic-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { DemographicComponent } from './demographic/demographic.component';
import { ValidationMessagePipe } from 'src/app/shared/pipe/validation-message.pipe';

/**
 * @description This is the feature module for the demographic module.
 * @author Shashank Agrawal
 *
 * @export
 * @class DemographicModule
 */
@NgModule({
  declarations: [DemographicComponent,ValidationMessagePipe],
  imports: [CommonModule, DemographicRoutingModule, ReactiveFormsModule, SharedModule, MatKeyboardModule]
})
export class DemographicModule {}
