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

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
    constructor(private redirectService: LoginRedirectService,
                private router: Router,
                private headerService: HeaderService,
                private dialog: MatDialog) { }
    // function which will be called for all http calls
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
        withCredentials : true
      });
        return next.handle(request).pipe(tap(event => {
      if (event instanceof HttpResponse) {
        console.log(event);
        if (event.url.split('/').includes('validateToken')) {
          if (event.body.response) {
            this.headerService.setUsername(event.body.response.userId);
            this.headerService.setRoles(event.body.response.role);
          }
        }
      }
    }, err => {
        if (err instanceof HttpErrorResponse) {
        console.log(err.status);
        if (err.status === 401 || err.status === 403) {
          this.redirectService.redirect(window.location.href);
        } else {
         this.dialog.open(DialogComponent, {
           width: '868px',
           height: '190px',
           data: {
            case: 'MESSAGE',
            title: 'Technical Error',
            message: 'A technical error has occurred. Please refresh your page to continue or try again later',
            btnTxt: 'Ok'
           },
           disableClose: true
         });
        }
    }}));
  }
}
