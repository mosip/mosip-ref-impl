import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './authservice.service';
@Injectable({
  providedIn: 'root'
})
export class LanguageGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  canActivate(route: ActivatedRouteSnapshot): boolean | Observable<boolean> {
    return this.authService.isLanguagesSet();
  }
}
