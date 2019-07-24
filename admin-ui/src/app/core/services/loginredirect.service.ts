import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { CookieService } from 'ngx-cookie-service';
import * as config from 'src/assets/config.json';

@Injectable()
export class LoginRedirectService {

  constructor(private cookie: CookieService) { }

  redirect(url: string) {
    const stateParam = uuid();
    this.cookie.set('state', stateParam, undefined, '/');
   // console.log('returning false login redirect' + stateParam);
    window.location.href = `${config.baseUrl}authmanager/login/` + btoa(url);
  }
}
