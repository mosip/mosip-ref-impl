import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { MaterialModule } from './shared/material.module';
import { CookieService } from 'ngx-cookie-service';
import { AppConfigService } from './app-config.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatKeyboardModule } from 'ngx7-material-keyboard';

const appInitialization = (appConfig: AppConfigService) => {
  return () => {
    return appConfig.loadAppConfig();
  };
};


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    BrowserAnimationsModule,
    MaterialModule, 
    FormsModule, 
    MatKeyboardModule,
    ReactiveFormsModule
  ],
  providers: [CookieService,
              AppConfigService,
              {
                provide: APP_INITIALIZER,
                useFactory: appInitialization,
                multi: true,
                deps: [AppConfigService]
              }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
