import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { CookieService } from 'ngx-cookie-service';
import { AppConfigService } from 'src/app/app-config.service';


@Injectable()
export class LoginRedirectService {

  constructor(private cookie: CookieService, private appService: AppConfigService) { }

  redirect(url: string) {
    const stateParam = uuid();
    this.cookie.set('state', stateParam, undefined, '/');
   // console.log('returning false login redirect' + stateParam);
    window.location.href = `${this.appService.getConfig().baseUrl}authmanager/login/` + btoa(url);
  }
}
