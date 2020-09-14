import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

import { AuthRoutingModule } from "./auth-routing.module";
import { LoginComponent } from "./login/login.component";
import { AppRoutingModule } from "../app-routing.module";
import { SharedModule } from "../shared/shared.module";
import { CoreModule } from "../core/core.module";
import {
  RecaptchaModule,
  RECAPTCHA_LANGUAGE,
} from "ng-recaptcha";
import { ConfigService } from "../core/services/config.service";
import * as appConstants from "../app.constants";
import { CaptchaComponent } from './captcha/captcha.component';
export const language = new ConfigService().getConfigByKey(
  appConstants.CONFIG_KEYS.mosip_primary_language
);
@NgModule({
  declarations: [LoginComponent, CaptchaComponent],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    AppRoutingModule,
    SharedModule,
    CoreModule,
    RecaptchaModule
  ],
  providers: [
    {
      provide: RECAPTCHA_LANGUAGE,
      useValue: language,
    },
  ],
})
export class AuthModule {}
