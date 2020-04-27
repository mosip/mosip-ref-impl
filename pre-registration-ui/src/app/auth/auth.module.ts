import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

import { AuthRoutingModule } from "./auth-routing.module";
import { LoginComponent } from "./login/login.component";
import { AppRoutingModule } from "../app-routing.module";
import { SharedModule } from "../shared/shared.module";
import { CoreModule } from "../core/core.module";
import { FooterComponent } from "../core/footer/footer.component";
import {
  RecaptchaModule,
  RecaptchaFormsModule,
  RECAPTCHA_LANGUAGE,
} from "ng-recaptcha";
import { ConfigService } from "../core/services/config.service";
import * as appConstants from "../app.constants";
export const language = new ConfigService().getConfigByKey(
  appConstants.CONFIG_KEYS.mosip_primary_language
);
@NgModule({
  declarations: [LoginComponent],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    AppRoutingModule,
    SharedModule,
    CoreModule,
    RecaptchaModule,
    RecaptchaFormsModule,
  ],
  providers: [
    {
      provide: RECAPTCHA_LANGUAGE,
      useValue: language,
    },
  ],
})
export class AuthModule {}
