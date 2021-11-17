import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRedirectService } from './loginredirect.service';
import { Router } from '@angular/router';
import { HeaderService } from './header.service';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';
import * as appConstants from 'src/app/app.constants';
import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  errorMessages: any;
  decoded: any;

  constructor(
    private redirectService: LoginRedirectService,
    private router: Router,
    private headerService: HeaderService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private appService: AppConfigService
  ) {}
  // function which will be called for all http calls
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    request = request.clone({
      withCredentials: true
    });
    return next.handle(request).pipe(
      tap(
        event => {
          if (event instanceof HttpResponse) {
            //console.log(event);
            if (event.url.split('/').includes('validateToken')) {
                if (event.body.response) {
                  this.decoded = jwt_decode(event.body.response.token);
                  this.headerService.setDisplayUserName(this.decoded["name"]);
                  this.headerService.setUsername(event.body.response.userId);
                  this.headerService.setRoles(event.body.response.role);
                  this.headerService.setUserPreferredLanguage(this.decoded["locale"]);
                }
                if (
                  event.body.errors !== null &&
                  (event.body.errors[0]['errorCode'] ===
                    appConstants.AUTH_ERROR_CODE[0] || event.body.errors[0]['errorCode'] === appConstants.AUTH_ERROR_CODE[1])
                ) {
                  this.redirectService.redirect(window.location.href);
                }
              }
          }
        },
        err => {
          if (err instanceof HttpErrorResponse) {
            console.log(err.status);
            console.log(err);
            if (err.status === 401) {
              this.redirectService.redirect(window.location.href);
            }else if (err.status === 403) {
              this.translateService
                .getTranslation(this.appService.getConfig().primaryLangCode)
                .subscribe(response => {
                  this.errorMessages = response.errorPopup;
                  this.dialog.open(DialogComponent, {
                    width: '868px',
                    height: '190px',
                    data: {
                      case: 'MESSAGE',
                      title: this.errorMessages.unauthorized.title,
                      message: this.errorMessages.unauthorized.message,
                      btnTxt: this.errorMessages.unauthorized.btnTxt
                    },
                    disableClose: true
                  });
                });
            } else {
              if (err.url.includes('validateToken')) {

                this.translateService
                .getTranslation(this.appService.getConfig().primaryLangCode)
                .subscribe(response => {
                  this.errorMessages = response.errorPopup;
                  this.dialog.open(DialogComponent, {
                    width: '868px',
                    height: '190px',
                    data: {
                      case: 'MESSAGE',
                      title: this.errorMessages.unknown.title,
                      message: this.errorMessages.unknown.message,
                      btnTxt: this.errorMessages.unknown.btnTxt
                    },
                    disableClose: true
                  });
                });

              }else{
                this.translateService
                .getTranslation(this.appService.getConfig().primaryLangCode)
                .subscribe(response => {
                  this.errorMessages = response.errorPopup;
                  this.dialog.open(DialogComponent, {
                    width: '868px',
                    height: '190px',
                    data: {
                      case: 'MESSAGE',
                      title: this.errorMessages.technicalError.title,
                      message: this.errorMessages.technicalError.message,
                      btnTxt: this.errorMessages.technicalError.btnTxt
                    },
                    disableClose: true
                  });
                });
              }              
            }
          }
        }
      )
    );
  }
}
