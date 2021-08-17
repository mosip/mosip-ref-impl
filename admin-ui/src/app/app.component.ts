import { Component, OnInit, HostListener } from '@angular/core';
import {
  RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  Router  
} from '@angular/router';
import { AppConfigService } from './app-config.service';
import { MatDialog } from '@angular/material';
import { DialogComponent } from './shared/dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import {MatKeyboardService} from 'ngx7-material-keyboard';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';
  loading = true;
  primaryLangCode: string;
  secondaryLangCode: string;
  popUpMessage: any;

  subscribed: any;

  constructor(
    private router: Router,
    private appConfigService: AppConfigService,
    private dialog: MatDialog,
    private keyboardService: MatKeyboardService,
    private translate: TranslateService

  ) {
    this.primaryLangCode = this.appConfigService.getConfig()['primaryLangCode'];
    this.secondaryLangCode = this.appConfigService.getConfig()[
      'secondaryLangCode'
    ];
    this.translate.getTranslation(this.primaryLangCode).subscribe(response => {
      this.popUpMessage = response;
    });
    this.subscribed = router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event);
    });
  }

  ngOnInit(): void {
    if (this.isPrimaryOrSecondaryLanguageEmpty()) {
      const data = {
        case: 'ERROR',
        title: 'ERROR',
        message:
          'The system has encountered a technical error. Administrator to setup the necessary language configuration(s)'
      };
      this.showErrorMessage(data);
    }
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (this.keyboardService.isOpened) {
      this.keyboardService.dismiss();
    }
  }

  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
    }
    if (event instanceof NavigationEnd) {
      this.loading = false;
      this.subscribed.unsubscribe();
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.loading = false;
      this.subscribed.unsubscribe();
    }
    if (event instanceof NavigationError) {
      this.loading = false;
      this.subscribed.unsubscribe();
    }
  }
  isPrimaryOrSecondaryLanguageEmpty(): boolean {
    if (
      this.primaryLangCode === null ||
      this.primaryLangCode.trim().length === 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  showErrorMessage(input) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data: input,
      disableClose: true
    });
  }
}
