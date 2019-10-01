import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material';
import { DialougComponent } from 'src/app/shared/dialoug/dialoug.component';
import { Subscription } from 'rxjs';
import LanguageFactory from 'src/assets/i18n';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  flag = false;
  subscription: Subscription;
  constructor(
    public authService: AuthService,
    private translate: TranslateService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.translate.use(localStorage.getItem('langCode'));
  }

  ngOnInit() {
    this.subscription = this.authService.myProp$.subscribe(res => {
      this.flag = res;
    });
  }

  onLogoClick() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  onHome() {
    let homeURL = '';
    homeURL = 'dashboard';
    this.router.navigate([homeURL]);
  }

  async doLogout() {
    await this.showMessage();
  }

  showMessage() {
    let factory = new LanguageFactory(localStorage.getItem('langCode'));
    let response = factory.getCurrentlanguage();
    const secondaryLanguagelabels = response['login']['logout_msg'];
    localStorage.removeItem('loggedOutLang');
    localStorage.removeItem('loggedOut');
    const data = {
      case: 'MESSAGE',
      message: secondaryLanguagelabels
    };
    this.dialog
      .open(DialougComponent, {
        width: '350px',
        data: data
      })
      .afterClosed()
      .subscribe(() => this.authService.onLogout());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
