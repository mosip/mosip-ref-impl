import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as appConstants from '../../app.constants';
import { HeaderService } from './header.service';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { AppConfigService } from 'src/app/app-config.service';
import { TranslateService } from '@ngx-translate/core';
import {MatKeyboardService} from 'ngx7-material-keyboard';

@Injectable({
  providedIn: 'root'
})
export class RolesGuard implements CanActivate {

  popupMessages: any;

  constructor(private headerService: HeaderService,
              private dialog: MatDialog,
              private router: Router,
              private appService: AppConfigService,
              private keyboardService: MatKeyboardService,
              private translateService: TranslateService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.keyboardService.isOpened) {
      this.keyboardService.dismiss();
    }
    const x = appConstants.navItems.filter(item => state.url.indexOf(item.route) >= 0);
    let flag = false;
    if (x[0].children) {
      const y = x[0].children.filter(item => state.url.indexOf(item.route) >= 0);
      flag = this.checkRole(y[0].roles);
    } else {
      flag = this.checkRole(x[0].roles);
    }
    if (flag) {
      return flag;
    } else {
      this.showMessage();
      return flag;
    }
  }

  private checkRole(roles: string[]): boolean {
    const userRoles = this.headerService.getRoleCodes().split(',');
    let flag = false;
    for (let i in roles) {
      if (userRoles.indexOf(roles[i]) >= 0) {
        flag = true;
        break;
      }
    }
    return flag;
  }

  private getMessage() {
    return new Promise((resolve, reject) => {
      this.translateService.getTranslation(this.appService.getConfig()['primaryLangCode']).subscribe(response => {
        this.popupMessages = response['errorPopup']['unauthorized'];
        resolve(true);
      });
    });
  }

  private async showMessage() {
    await this.getMessage();
    this.dialog.open(DialogComponent, {
      width: '650px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages.title,
        message: this.popupMessages.message,
        btnTxt: this.popupMessages.btnTxt
      },
      disableClose: true
    }).afterClosed().subscribe(() => {
      this.router.navigateByUrl('admin/home');
    });
  }
}
