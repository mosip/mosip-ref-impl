
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError} from 'rxjs/operators';
import { AppConfigService } from 'src/app/app-config.service';


/**
 * @description AuthService for Admin App
 * @author Urvil Joshi
 */
@Injectable()
export class AuthService {

  constructor(private router: Router, private http: HttpClient, private appService: AppConfigService) { }
   rolesString: string ;
   token: string;
   roles: string[];
   isAuthenticated(): Observable<boolean> {
    /*return this.http.get(`${this.appService.getConfig().baseUrl}${this.appService.getConfig().validateToken}`, { observe: 'response'}).
    pipe(map(res => res.status === 200),
    catchError(error => {
      console.log(error);
      return of(false);
    }));*/
    return of(true);
  }

  isLanguagesSet() {
    const primaryLangCode = this.appService.getConfig()['primaryLangCode'];
    const secondaryLangCode = this.appService.getConfig()[
      'secondaryLangCode'
    ];
    console.log(primaryLangCode + ' ' + secondaryLangCode);
    if (
      primaryLangCode === null ||
      primaryLangCode === '' || primaryLangCode.length === 0 &&
      secondaryLangCode === null ||
      secondaryLangCode === '' || secondaryLangCode.length === 0
    ) {
      return false;
    } else {
      return true;
    }
  }
}
