
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError} from 'rxjs/operators';
import * as config from 'src/assets/config.json';


/**
 * @description AuthService for Admin App
 * @author Urvil Joshi
 */
@Injectable()
export class AuthService {

  constructor(private router: Router, private http: HttpClient) { }
   rolesString: string ;
   token: string;
   roles: string[];
   isAuthenticated(): Observable<boolean> {
    return this.http.get(`${config.baseUrl}authmanager/authorize/admin/validateToken`, { observe: 'response'}).
    pipe(map(res => res.status === 200),
    catchError(error => {
      console.log(error);
      return of(false);
    }));
  }
}
