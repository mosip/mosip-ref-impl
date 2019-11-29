import { Injectable } from '@angular/core';
import { UnloadDeactivateGuardService } from './unload-guard/unload-deactivate-guard.service';
import { CanDeactivate } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import LanguageFactory from 'src/assets/i18n';
import { MatDialog } from '@angular/material';
import { DialougComponent } from '../dialoug/dialoug.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuardService implements CanDeactivate<UnloadDeactivateGuardService> {
  primaryLangCode = localStorage.getItem('langCode');
  constructor(private authService: AuthService, public dialog: MatDialog) {}

  canDeactivate(component: UnloadDeactivateGuardService): boolean | Observable<boolean> | Promise<boolean> {
    if (this.authService.isAuthenticated() && !component.canDeactivate()) {
      let factory = new LanguageFactory(this.primaryLangCode);
      let response = factory.getCurrentlanguage();
      const message = response['dialog']['navigation_alert'];
      const ok_text = response['dialog']['action_ok'];
      const no_text = response['dialog']['title_discard'];
      return new Promise((resolve, reject) => {
        const body = {
          case: 'CONFIRMATION',
          message: message,
          yesButtonText: ok_text,
          noButtonText: no_text
        };
        this.dialog
          .open(DialougComponent, { width: '250px', data: body })
          .beforeClosed()
          .subscribe(res => {
            if (res) resolve(true);
            else resolve(false);
          });
      });
    } else return true;
  }
}
