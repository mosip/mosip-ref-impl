import { NgModule } from "@angular/core";
import { CreateComponent } from './create/create.component';
import { ViewComponent } from './view/view.component';
import { PolicyHeaderComponent } from './policy-header/policy-header.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/material.module';
import { I18nModule } from 'src/app/i18n.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatKeyboardModule } from 'ngx7-material-keyboard';
import { PolicyRoutingModule } from './policy-routing.module';
import { AuthComponent } from './auth/auth.component';
import { AuthpolicyHeaderComponent } from './authPolicies/authpolicy-header/authpolicy-header.component';

@NgModule({
    imports:[
        CommonModule,
        PolicyRoutingModule,
        SharedModule,
        MaterialModule,
        I18nModule,
        ReactiveFormsModule,
        FormsModule,
        MatKeyboardModule
    ],
    declarations:[CreateComponent, ViewComponent, PolicyHeaderComponent, AuthComponent, AuthpolicyHeaderComponent]
})
export class PolicyModule{}