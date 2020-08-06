import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ConfigService } from "../core/services/config.service";
import { AuthService } from "./auth.service";
@Injectable({
  providedIn: "root",
})
export class DefaultLangGuardService implements CanActivate {
  constructor(
    private router: Router,
    private config: ConfigService,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (
      this.authService.getPrimaryLang() !== localStorage.getItem("langCode")
    ) {
      localStorage.setItem("langCode", "eng");
      this.router.navigate(['eng']);
    }
    return true;
  }
}
