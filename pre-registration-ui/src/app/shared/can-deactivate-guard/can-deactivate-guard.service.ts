import { Injectable } from '@angular/core';
import { UnloadDeactivateGuardService } from './unload-guard/unload-deactivate-guard.service';
import { CanDeactivate } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import LanguageFactory from 'src/assets/i18n';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuardService implements CanDeactivate<UnloadDeactivateGuardService> {
  primaryLangCode = localStorage.getItem('langCode');
  constructor(private authService: AuthService) {}

  canDeactivate(component: UnloadDeactivateGuardService): boolean {
    if (this.authService.isAuthenticated() && !component.canDeactivate()) {
      // in progress TO DO
      let factory = new LanguageFactory(this.primaryLangCode);
      let response = factory.getCurrentlanguage();
      const message = response['dialog']['navigation_alert'];

      // if (confirm(message)) {
      //   return true;
      // } else {
      //   return false;
      // }
    }
    return true;
  }
}
