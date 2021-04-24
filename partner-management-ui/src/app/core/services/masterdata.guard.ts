import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate
} from '@angular/router';
import { Observable } from 'rxjs';
import * as appConstants from 'src/app/app.constants';

@Injectable({
  providedIn: 'root'
})
export class MasterdataGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot
  ): boolean | Observable<boolean> {
    if (Object.keys(appConstants.masterdataMapping).includes(route.params.type)) {
      return true;
    } else {
      return false;
    }
  }
}
