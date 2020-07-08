import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { UserIdleService } from "angular-user-idle";
import { DataStorageService } from "../core/services/data-storage.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  myProp = new BehaviorSubject<boolean>(false);
  cookieName = "Authorization";
  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private userIdle: UserIdleService
  ) {}

  myProp$ = this.myProp.asObservable();
  token: string;

  setToken() {
    this.token = this.getCookie();
  }

  removeToken() {
    this.token = null;
    this.deleteCookie();
  }

  getCookie() {
    const name = this.cookieName;
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    if (match) return match[2];
  }

  deleteCookie() {
    const name = this.cookieName;
    console.log(this.getCookie());
    document.cookie = `${name}=null`;
  }

  isAuthenticated() {
    if (
      localStorage.getItem("loggedIn") === "true" &&
      (this.token !== null || this.token !== undefined)
    ) {
      return true;
    } else {
      return false;
    }
  }

  onLogout() {
    localStorage.setItem("loggedIn", "false");
    localStorage.setItem("loggedOut", "true");
    this.removeToken();
    localStorage.removeItem('config');
    this.dataStorageService.onLogout().subscribe();
    this.router.navigate(["/"]);
    this.userIdle.stopWatching();
  }
}
