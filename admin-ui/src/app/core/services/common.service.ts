import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataStorageService } from './data-storage.service';
import { MatDialog } from '@angular/material';
import { AppConfigService } from 'src/app/app-config.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})

export class CommonService {

  actionMessages: any;

  constructor(
    private router: Router,
    private dataService: DataStorageService,
    private dialog: MatDialog,
    private appService: AppConfigService,
    private translate: TranslateService
  ) {
      translate.getTranslation(appService.getConfig().primaryLangCode).subscribe(result => {
        this.actionMessages = result.actionMessages;
      });
  }

  private showMessage(data: any) {
    this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        case: 'MESSAGE',
        ...data
      }
    });
  }

  centerView(centerId: string, url: string) {
    url = url.replace('$id', centerId);
    this.router.navigateByUrl(url);
  }

  decommissionCenter(centerId: string, url: string) {
    this.dataService
      .decommissionCenter(centerId)
      .subscribe(response => {
        if (response['errors'] !== null && response['errors'].length === 0) {
          const obj = {
            title: this.actionMessages.decommission['success-title'],
            message: this.actionMessages.decommission['success-message'],
            btnTxt: this.actionMessages.decommission['btnTxt']
          };
          this.showMessage(obj);
        } else {
          const obj = {
            title: this.actionMessages.decommission['error-title'],
            message: this.actionMessages.decommission['error-message'],
            btnTxt: this.actionMessages.decommission['btnTxt']
          };
          this.showMessage(obj);
        }
      }, error => {
        const obj = {
          title: this.actionMessages.decommission['error-title'],
          message: this.actionMessages.decommission['error-message'],
          btnTxt: this.actionMessages.decommission['btnTxt']
        };
        this.showMessage(obj);
      });
  }
}
