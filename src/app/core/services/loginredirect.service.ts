import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { CookieService } from 'ngx-cookie-service';
/**
 * @description This service is responsible to redirect to keycloak.
 * @author Urvil Joshi
 */
@Injectable()
export class LoginRedirectService {

  constructor(private cookie: CookieService) { }

  redirect(url: string) {
    const stateParam = uuid();
    this.cookie.set('state', stateParam, undefined, '/');
    console.log('returning false login redirect' + stateParam);
    window.location.href = 'https://dev.mosip.io/r2/v1/authmanager/login/' + btoa(url);
  }
}
