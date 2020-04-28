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
import { DeviceModel } from '../models/device.model';
import { MachineModel } from '../models/machine.model';
import { CenterTypeModel } from '../models/center-type.model';
import { BlacklistedWordsModel } from '../models/blacklisted-words.model';
import { GenderModel } from '../models/gender.model';
import { IndividualTypeModel } from '../models/individual-type.model';
import { LocationModel } from '../models/location.model';
import { TemplateModel } from '../models/template.model';
import { TitleModel } from '../models/title.model';
import { DeviceSpecsModel } from '../models/device-specs.model';
import { DeviceTypesModel } from '../models/device-types.model';
import { MachineSpecsModel } from '../models/machine-specs.model'
import { MachineTypesModel } from '../models/machine-types.model';
import { DocumentTypeModel } from '../models/document-type.model';
import { DocumentCategoriesModel } from '../models/document-categories.model';
import { HolidaySpecsModel } from '../models/holiday-specs.model';

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
      width: '400px',
      data: {
        case: 'MESSAGE',
        ...data
      }
    });
  }

  private confirmationPopup(type: string, data: any) {

    let url = this.router.url.split('/')[3];
    let textToDisplay = null;
    
    if(url === "centers"){
      textToDisplay = data.name;
    }else if(url === "machines"){
      textToDisplay = data.name;
    }else if(url === "devices"){
      textToDisplay = data.name;
    }else if(url === "center-type"){
      textToDisplay = data.name;
    }else if(url === "blacklisted-words"){
      textToDisplay = data.word;
    }else if(url === "gender-type"){
      textToDisplay = data.genderName;
    }else if(url === "individual-type"){
      textToDisplay = data.name;
    }else if(url === "location"){
      textToDisplay = data.zone;
    }else if(url === "templates"){
      textToDisplay = data.name;
    }else if(url === "title"){
      textToDisplay = data.titleName;
    }else if(url === "device-specs"){
      textToDisplay = data.name;
    }else if(url === "device-types"){
      textToDisplay = data.name;
    }else if(url === "machine-specs"){
      textToDisplay = data.name;
    }else if(url === "machine-type"){
      textToDisplay = data.name;
    }else if(url === "document-type"){
      textToDisplay = data.name;
    }else if(url === "document-categories"){
      textToDisplay = data.name;
    }else if(url === "holiday"){
      textToDisplay = data.holidayName;
    }
    
    const obj = {
      case: 'CONFIRMATION',
      title: this.actionMessages[type]['confirmation-title'],
      message: this.actionMessages[type]['confirmation-message'][0] + textToDisplay + this.actionMessages[type]['confirmation-message'][1],
      yesBtnTxt: this.actionMessages[type]['yesBtnTxt'],
      noBtnTxt: this.actionMessages[type]['noBtnTxt']
    };
    return this.dialog.open(DialogComponent, {
      width: '650px',
      data: obj
    });
  }

  private createMessage(type: string, listItem: string, data?: any) {
    let obj = {};
    if (type === 'success') {
      obj = {
        title: this.actionMessages[listItem]['success-title'],
        message: this.actionMessages[listItem]['success-message'][0] + data + this.actionMessages[listItem]['success-message'][1],
        btnTxt: this.actionMessages[listItem]['btnTxt']
      };
    } else if (type === 'error') {
      obj = {
        title: this.actionMessages[listItem]['error-title'],
        message: this.actionMessages[listItem]['error-message'][0] + data + this.actionMessages[listItem]['error-message'][1],
        btnTxt: this.actionMessages[listItem]['btnTxt']
      };
    }
    this.showMessage(obj);
  }

  private updateData(callingFunction: string, data: CenterModel) {
    const request = new RequestModel(
      appConstants.registrationDeviceCreateId,
      null,
      data
    );
    this.dataService.updateData(request).subscribe(
      response => {
        if (!response.errors || response.errors.length === 0) {
          this.createMessage('success', callingFunction, request.request.name);
          this.router.navigateByUrl(this.router.url);
        } else {
          this.createMessage('error', callingFunction, request.request.name);
        }
      },
      error => this.createMessage('error', callingFunction, request.request.name)
    );
  }

  private mapDataToCenterModelObject(data: any): CenterModel {
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

  private mapDataToDeviceModelObject(data: any): DeviceModel {
    const primaryObject = new DeviceModel(
      data.zoneCode,
      data.validityDateTime,
      data.name,
      data.macAddress,
      data.serialNum,
      data.ipAddress,
      data.id,
      data.isActive,
      data.langCode,
      data.deviceSpecId,
    );
    return primaryObject;
  }

  private mapDataToMachineModelObject(data: any): MachineModel {
    const primaryObject = new MachineModel(
      data.zoneCode,
      data.validityDateTime,
      data.name,
      data.machineSpecId,
      data.macAddress,
      data.serialNum,
      data.ipAddress,
      data.id,
      data.isActive,
      data.langCode,
    );
    return primaryObject;
  }

  private mapDataToCenterTypeModelObject(data: any): CenterTypeModel {
    const primaryObject = new CenterTypeModel(
      data.code,
      data.langCode,
      data.name,
      data.descr,
      data.isActive,
      data.id,
    );
    return primaryObject;
  }

  private mapDataToBlacklistedWordsModelObject(data: any): BlacklistedWordsModel {
    const primaryObject = new BlacklistedWordsModel(
      data.word,
      data.word,
      data.description,
      data.langCode,
      data.isActive,
      data.id,
    );
    return primaryObject;
  }

  private mapDataToGenderModelObject(data: any): GenderModel {
    const primaryObject = new GenderModel(
      data.code,
      data.genderName,
      data.langCode,
      data.isActive,
      data.id,
    );
    return primaryObject;
  }

  private mapDataToIndividualTypeModelObject(data: any): IndividualTypeModel {
    const primaryObject = new IndividualTypeModel(
      data.code,
      data.name,
      data.langCode,
      data.isActive,
      data.id,
    );
    return primaryObject;
  }

  private mapDataToLocationModelObject(data: any): LocationModel {
    const primaryObject = new LocationModel(
      data.hierarchyLevel,
      data.hierarchyName,
      data.parentLocCode,
      data.langCode,
      data.isActive,
      data.id,
    );
    return primaryObject;
  } 

  private mapDataToTemplateModelObject(data: any): TemplateModel {
    const primaryObject = new TemplateModel(
      data.name,
      data.description,
      data.fileFormatCode,
      data.model,
      data.fileText,
      data.moduleId,
      data.moduleName,
      data.templateTypeCode,
      data.langCode,
      data.isActive,
      data.id,
    );
    return primaryObject;
  }

  private mapDataToTitleModelObject(data: any): TitleModel {
    const primaryObject = new TitleModel(
      data.code,
      data.titleName,
      data.titleDescription,
      data.langCode,
      data.isActive,
      data.id,
    );
    return primaryObject;
  }

  private mapDataToDeviceSpecsModelObject(data: any): DeviceSpecsModel {
    const primaryObject = new DeviceSpecsModel(
      data.name,
      data.brand,
      data.model,
      data.deviceTypeCode,
      data.minDriverversion,
      data.description,
      data.langCode,
      data.isActive,
      data.id,
    );
    return primaryObject;
  }

  private mapDataToDeviceTypesModelObject(data: any): DeviceTypesModel {
    const primaryObject = new DeviceTypesModel(
      data.code,
      data.name,
      data.description,
      data.langCode,
      data.isActive,
      data.id,
    );
    return primaryObject;
  }

  private mapDataToMachineSpecsModelObject(data: any): MachineSpecsModel {
    const primaryObject = new MachineSpecsModel(
      data.name,
      data.brand,
      data.model,
      data.machineTypeCode,
      data.minDriverversion,
      data.description,
      data.langCode,
      data.isActive,
      data.id,
    );
    return primaryObject;
  }

  private mapDataToMachineTypesModelObject(data: any): MachineTypesModel {
    const primaryObject = new MachineTypesModel(
      data.code,
      data.name,
      data.description,
      data.langCode,
      data.isActive,
      data.id,
    );
    return primaryObject;
  }

  private mapDataToDocumentTypeModelObject(data: any): DocumentTypeModel {
    const primaryObject = new DocumentTypeModel(
      data.code,
      data.name,
      data.description,
      data.langCode,
      data.isActive,
      data.id,
    );
    return primaryObject;
  }

  private mapDataToDocumentCategoriesModelObject(data: any): DocumentCategoriesModel {
    const primaryObject = new DocumentCategoriesModel(
      data.code,
      data.name,
      data.description,
      data.langCode,
      data.isActive,
      data.id,
    );
    return primaryObject;
  }

  private mapDataToHolidayMasterModelObject(data: any): HolidaySpecsModel {
    const primaryObject = new HolidaySpecsModel(
      data.holidayDate,
      data.holidayName,
      data.holidayDesc,
      data.holidayDate,
      data.holidayName,
      data.holidayDesc,
      "NTH",
      "eng",
      data.isActive,
      data.holidayId,
    );
    return primaryObject;
  }
  
  centerEdit(data: any, url: string, idKey: string) {
    this.auditService.audit(9, 'ADM-084', {
      buttonName: 'edit',
      masterdataName: this.router.url.split('/')[
        this.router.url.split('/').length - 2
      ]
    });
    url = url.replace('$id', data[idKey]);
    this.router.navigateByUrl(url + '?editable=true');
  }

  decommission(data: any, url: string, idKey: string) {
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
    this.confirmationPopup('decommission', data).afterClosed().subscribe(res => {
      if (res) {
        this.auditService.audit(18, 'ADM-098', 'decommission');
        this.dataService.decommission(data[idKey]).subscribe(
          response => {
            if (!response['errors']) {
              this.createMessage('success', 'decommission', data.name);
              if (this.router.url.indexOf('single-view') >= 0) {
                this.router.navigateByUrl('admin/resources/centers/view');
              } else {
                this.router.navigateByUrl(this.router.url);
              }
            } else {
              this.createMessage('error', 'decommission', data.name);
            }
          },
          error => {
            this.createMessage('error', 'decommission', data.name);
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
    this.confirmationPopup('activate', data).afterClosed().subscribe(res => {
      if (res) {
        let url = this.router.url.split('/')[3];
        this.auditService.audit(18, 'ADM-100', 'activate');
        let dynamicObject = null;
        
        if(url === "centers"){
          dynamicObject = this.mapDataToCenterModelObject(data);
        }else if(url === "machines"){
          dynamicObject = this.mapDataToMachineModelObject(data);
        }else if(url === "devices"){
          dynamicObject = this.mapDataToDeviceModelObject(data);
        }else if(url === "center-type"){
          dynamicObject = this.mapDataToCenterTypeModelObject(data);
        }else if(url === "blacklisted-words"){
          dynamicObject = this.mapDataToBlacklistedWordsModelObject(data);
        }else if(url === "gender-type"){
          dynamicObject = this.mapDataToGenderModelObject(data);
        }else if(url === "individual-type"){
          dynamicObject = this.mapDataToIndividualTypeModelObject(data);
        }else if(url === "location"){
          dynamicObject = this.mapDataToLocationModelObject(data);
        }else if(url === "templates"){
          dynamicObject = this.mapDataToTemplateModelObject(data);
        }else if(url === "title"){
          dynamicObject = this.mapDataToTitleModelObject(data);
        }else if(url === "device-specs"){
          dynamicObject = this.mapDataToDeviceSpecsModelObject(data);
        }else if(url === "device-types"){
          dynamicObject = this.mapDataToDeviceTypesModelObject(data);
        }else if(url === "machine-specs"){
          dynamicObject = this.mapDataToMachineSpecsModelObject(data);
        }else if(url === "machine-type"){
          dynamicObject = this.mapDataToMachineTypesModelObject(data);
        }else if(url === "document-type"){
          dynamicObject = this.mapDataToDocumentTypeModelObject(data);
        }else if(url === "document-categories"){
          dynamicObject = this.mapDataToDocumentCategoriesModelObject(data);
        }else if(url === "holiday"){
          dynamicObject = this.mapDataToHolidayMasterModelObject(data);
        }
        
        dynamicObject.isActive = true;
        console.log(dynamicObject);
        this.updateData('activate', dynamicObject);
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
    this.confirmationPopup('deactivate', data).afterClosed().subscribe(res => {
      if (res) {

        let url = this.router.url.split('/')[3];
        this.auditService.audit(18, 'ADM-100', 'deactivate');
        let dynamicObject = null;
        if(url === "centers"){
          dynamicObject = this.mapDataToCenterModelObject(data);
        }else if(url === "machines"){
          dynamicObject = this.mapDataToMachineModelObject(data);
        }else if(url === "devices"){
          dynamicObject = this.mapDataToDeviceModelObject(data);
        }else if(url === "center-type"){
          dynamicObject = this.mapDataToCenterTypeModelObject(data);
        }else if(url === "blacklisted-words"){
          dynamicObject = this.mapDataToBlacklistedWordsModelObject(data);
        }else if(url === "gender-type"){
          dynamicObject = this.mapDataToGenderModelObject(data);
        }else if(url === "individual-type"){
          dynamicObject = this.mapDataToIndividualTypeModelObject(data);
        }else if(url === "location"){
          dynamicObject = this.mapDataToLocationModelObject(data);
        }else if(url === "templates"){
          dynamicObject = this.mapDataToTemplateModelObject(data);
        }else if(url === "title"){
          dynamicObject = this.mapDataToTitleModelObject(data);
        }else if(url === "device-specs"){
          dynamicObject = this.mapDataToDeviceSpecsModelObject(data);
        }else if(url === "device-types"){
          dynamicObject = this.mapDataToDeviceTypesModelObject(data);
        }else if(url === "machine-specs"){
          dynamicObject = this.mapDataToMachineSpecsModelObject(data);
        }else if(url === "machine-type"){
          dynamicObject = this.mapDataToMachineTypesModelObject(data);
        }else if(url === "document-type"){
          dynamicObject = this.mapDataToDocumentTypeModelObject(data);
        }else if(url === "document-categories"){
          dynamicObject = this.mapDataToDocumentCategoriesModelObject(data);
        }else if(url === "holiday"){
          dynamicObject = this.mapDataToHolidayMasterModelObject(data);
        }

        dynamicObject.isActive = false;
        console.log(dynamicObject);
        this.updateData('deactivate', dynamicObject);
      } else {
        this.auditService.audit(19, 'ADM-103', 'deactivate');
      }
    });
  }
}
