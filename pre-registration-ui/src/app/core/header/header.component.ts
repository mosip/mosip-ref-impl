import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "../../auth/auth.service";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material";
import { DialougComponent } from "src/app/shared/dialoug/dialoug.component";
import { Subscription } from "rxjs";
import { DataStorageService } from "../services/data-storage.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  flag = false;
  subscription: Subscription;
  userPreferredLang: string;

  constructor(
    public authService: AuthService,
    private translate: TranslateService,
    private router: Router,
    private dialog: MatDialog,
    private dataStorageService: DataStorageService
  ) {}

  ngOnInit() {
    this.translate.use(localStorage.getItem("langCode")); 
  }

  onLogoClick() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([
        localStorage.getItem("userPrefLanguage"),
        "dashboard",
      ]);
    } else {
      this.router.navigate(["/"]);
    }
  }

  onHome() {
    this.router.navigate([
      localStorage.getItem("userPrefLanguage"),
      "dashboard",
    ]);
  }

  async doLogout() {
    await this.showMessage();
  }

  showMessage() {
    let languagelabels ;
    this.dataStorageService
    .getI18NLanguageFiles(localStorage.getItem("userPrefLanguage"))
    .subscribe((response) => {
      languagelabels = response["login"]["logout_msg"];
      const data = {
        case: "MESSAGE",
        message: languagelabels,
      };
      this.dialog
        .open(DialougComponent, {
          width: "350px",
          data: data,
        })
        .afterClosed()
        .subscribe((response) => {
          if (response) {
            localStorage.removeItem("loggedOutLang");
            localStorage.removeItem("loggedOut");
            this.authService.onLogout();
          }
        });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
