import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataStorageService } from './data-storage.service';
import { MatDialog } from '@angular/material';
import { AppConfigService } from 'src/app/app-config.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { RequestModel } from '../models/request.model';
import * as appConstants from '../../app.constants';
import { CenterModel } from '../models/center.model';
import { AuditService } from './audit.service';

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
    private translate: TranslateService,
    private auditService: AuditService
  ) {
    translate
      .getTranslation(appService.getConfig().primaryLangCode)
      .subscribe(result => {
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

  private confirmationPopup(type: string, data: any) {
    const obj = {
      case: 'CONFIRMATION',
      title: this.actionMessages[type]['confirmation-title'],
      message: this.actionMessages[type]['confirmation-message'][0] + data + this.actionMessages[type]['confirmation-message'][1],
      yesBtnTxt: this.actionMessages[type]['yesBtnTxt'],
      noBtnTxt: this.actionMessages[type]['noBtnTxt']
    };
    return this.dialog.open(DialogComponent, {
      width: '350px',
      data: obj
    });
  }

  private createMessage(type: string, listItem: string, data?: any) {
    let obj = {};
    if (type === 'success') {
      obj = {
        title: this.actionMessages[listItem]['success-title'],
        message: this.actionMessages[listItem]['success-message'][0] + data + this.actionMessages[listItem]['success-message'][0],
        btnTxt: this.actionMessages[listItem]['btnTxt']
      };
    } else if (type === 'error') {
      obj = {
        title: this.actionMessages[listItem]['error-title'],
        message: this.actionMessages[listItem]['error-message'],
        btnTxt: this.actionMessages[listItem]['btnTxt']
      };
    }
    this.showMessage(obj);
  }

  private updateCenter(callingFunction: string, data: CenterModel) {
    const request = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      data
    );
    this.dataService.updateCenter(request).subscribe(
      response => {
        if (!response.errors || response.errors.length === 0) {
          this.createMessage('success', callingFunction, request.request.name);
          this.router.navigateByUrl(this.router.url);
        } else {
          this.createMessage('error', callingFunction);
        }
      },
      error => this.createMessage('error', callingFunction)
    );
  }

  private mapDataToObject(data: any): CenterModel {
    const primaryObject = new CenterModel(
      data.addressLine1,
      data.addressLine2,
      data.addressLine3,
      data.centerEndTime,
      data.centerStartTime,
      data.centerTypeCode,
      data.contactPerson,
      data.contactPhone,
      data.holidayLocationCode,
      this.appService.getConfig().primaryLangCode,
      data.latitude,
      data.postalCode,
      data.longitude,
      data.lunchEndTime,
      data.lunchStartTime,
      data.name,
      data.perKioskProcessTime,
      data.timeZone,
      data.workingHours,
      data.zoneCode,
      data.id,
      data.isActive,
      data.numberOfKiosks
    );
    return primaryObject;
  }

  centerView(data: any, url: string, idKey: string) {
    this.auditService.audit(9, 'ADM-084', {
      buttonName: 'view',
      masterdataName: this.router.url.split('/')[
        this.router.url.split('/').length - 2
      ]
    });
    url = url.replace('$id', data[idKey]);
    this.router.navigateByUrl(url);
  }

  decommissionCenter(data: any, url: string, idKey: string) {
    if (this.router.url.indexOf('single-view') >= 0) {
      this.auditService.audit(10, 'ADM-085', {
        buttonName: 'decommission',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 3
        ]
      });
    } else {
      this.auditService.audit(9, 'ADM-088', {
        buttonName: 'decommission',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 2
        ]
      });
    }
    this.confirmationPopup('decommission', data.name).afterClosed().subscribe(res => {
      if (res) {
        this.auditService.audit(18, 'ADM-098', 'decommission');
        this.dataService.decommissionCenter(data[idKey]).subscribe(
          response => {
            if (!response['errors']) {
              this.createMessage('success', 'decommission', data.name);
              if (this.router.url.indexOf('single-view') >= 0) {
                this.router.navigateByUrl('admin/resources/centers/view');
              } else {
                this.router.navigateByUrl(this.router.url);
              }
            } else {
              this.createMessage('error', 'decommission');
            }
          },
          error => {
            this.createMessage('error', 'decommission');
          }
        );
      } else {
        this.auditService.audit(19, 'ADM-099', 'decommission');
      }
    });
  }

  activateCenter(data: any, url: string, idKey: string) {
    if (this.router.url.indexOf('single-view') >= 0) {
      this.auditService.audit(10, 'ADM-086', {
        buttonName: 'activate',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 3
        ]
      });
    } else {
      this.auditService.audit(9, 'ADM-089', {
        buttonName: 'activate',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 2
        ]
      });
    }
    this.confirmationPopup('activate', data.name).afterClosed().subscribe(res => {
      if (res) {
        this.auditService.audit(18, 'ADM-100', 'activate');
        const centerObject = this.mapDataToObject(data);
        centerObject.isActive = true;
        console.log(centerObject);
        this.updateCenter('activate', centerObject);
      } else {
        this.auditService.audit(19, 'ADM-101', 'activate');
      }
    });
  }

  deactivateCenter(data: any, url: string, idKey: string) {
    if (this.router.url.indexOf('single-view') >= 0) {
      console.log(this.router.url.split('/'));
      this.auditService.audit(10, 'ADM-087', {
        buttonName: 'deactivate',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 3
        ]
      });
    } else {
      this.auditService.audit(9, 'ADM-090', {
        buttonName: 'deactivate',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 2
        ]
      });
    }
    this.confirmationPopup('deactivate', data.name).afterClosed().subscribe(res => {
      if (res) {
        this.auditService.audit(18, 'ADM-102', 'deactivate');
        const centerObject = this.mapDataToObject(data);
        centerObject.isActive = false;
        console.log(centerObject);
        this.updateCenter('deactivate', centerObject);
      } else {
        this.auditService.audit(19, 'ADM-103', 'deactivate');
      }
    });
  }
}
