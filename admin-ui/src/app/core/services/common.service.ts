import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataStorageService } from './data-storage.service';
import { MatDialog } from '@angular/material';
import { AppConfigService } from 'src/app/app-config.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { RequestModel } from '../models/request.model';
import * as appConstants from '../../app.constants';
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
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { FilterModel } from 'src/app/core/models/filter.model';
import { CenterService } from 'src/app/core/services/center.service';
import { HeaderService } from 'src/app/core/services/header.service';

import { AuditService } from './audit.service';


@Injectable({
  providedIn: 'root'
})
export class CommonService {
  actionMessages: any;
  centerRequest = {} as CenterRequest;

  constructor(
    private router: Router,
    private dataService: DataStorageService,
    private dialog: MatDialog,
    private appService: AppConfigService,
    private translate: TranslateService,
    private auditService: AuditService,
    private headerService: HeaderService,
    private centerService: CenterService
  ) {
    let lang = headerService.getUserPreferredLanguage();
    translate
      .getTranslation(lang)
      .subscribe(result => {
        this.actionMessages = result.actionMessages;
      });
  }

  private showMessage(data: any) {
    this.dialog.open(DialogComponent, {
      width: '550px',
      data: {
        case: 'MESSAGE',
        ...data
      }
    });
  }

  private confirmationPopup(type: string, data: any) {
    let url = this.router.url.split('/')[3];
    let textToDisplay = null;

    if(data.name){
      textToDisplay = data.name;
    }else{
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
    let url = this.router.url.split('/')[3];
    let textToDisplay = null;
    if(data.name){
      textToDisplay = data.name;
    }else{
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
    }
    
    if (type === 'success') {
      obj = {
        title: this.actionMessages[listItem]['success-title'],
        message: this.actionMessages[listItem]['success-message'][0] + textToDisplay + this.actionMessages[listItem]['success-message'][1],
        btnTxt: this.actionMessages[listItem]['btnTxt']
      };
    } else if (type === 'error') {
      obj = {
        title: this.actionMessages[listItem]['error-title'],
        message: this.actionMessages[listItem]['error-message'][0] + textToDisplay + this.actionMessages[listItem]['error-message'][1],
        btnTxt: this.actionMessages[listItem]['btnTxt']
      };
    }
    this.showMessage(obj);
  }

  private updateData(callingFunction: string, data: any, actualData:any) {
    const request = new RequestModel(
      appConstants.registrationDeviceCreateId,
      null,
      data
    );
    this.dataService.updateDataStatus(request).subscribe(
      response => {
        if (!response.errors || response.errors.length === 0) {
          this.createMessage('success', callingFunction, actualData);     
          this.router.navigateByUrl(this.router.url);
        } else {
          this.createMessage('error', callingFunction, actualData);
        }
      },
      error => this.createMessage('error', callingFunction, actualData)
    );
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
      null,
      data.id,
      data.isActive,      
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
      "KTA",
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

  mapCenter(data: any, url: string, idKey: string) {
    this.auditService.audit(9, 'ADM-084', {
      buttonName: 'mapCenter',
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
    console.log(data)
    this.confirmationPopup('decommission', data).afterClosed().subscribe(res => {
      if (res) {
        let url = this.router.url.split('/')[3];
        if (url === "devices" || url === "machines") {
          this.auditService.audit(18, 'ADM-100', 'unassign');
          let dynamicObject = data;
          delete dynamicObject.createdBy;
          delete dynamicObject.createdDateTime;
          delete dynamicObject.updatedBy;
          delete dynamicObject.updatedDateTime;
          delete dynamicObject.deletedDateTime;
          delete dynamicObject.isDeleted;
          delete dynamicObject.isActive;
          delete dynamicObject.zone;
          delete dynamicObject.deviceTypeName;
          delete dynamicObject.machineTypeName;
          delete dynamicObject.mapStatus;
          delete dynamicObject.langCode;
          dynamicObject.regCenterId = "";
          const request = new RequestModel(
            appConstants.registrationDeviceCreateId,
            null,
            dynamicObject
          );
          this.dataService.updateData(request).subscribe(
            response => {
              let obj = {};
              if (!response.errors || response.errors.length === 0) {
                this.auditService.audit(18, 'ADM-098', 'decommission');
                this.dataService.decommission(data[idKey]).subscribe(
                  response1 => {
                    if (!response1['errors']) {
                      this.createMessage('success', 'decommission', data);
                      if (this.router.url.indexOf('single-view') >= 0) {
                        this.router.navigateByUrl('admin/resources/'+url+'/view');
                      } else {
                        this.router.navigateByUrl(this.router.url);
                      }
                    } else {
                      this.createMessage('error', 'decommission', data);
                    }
                  },
                  error => {
                    this.createMessage('error', 'decommission', data);
                  }
                );
              } else {
                this.createMessage('error', 'decommission', data);
              }
            }
          );
        }
        else {
          this.auditService.audit(18, 'ADM-098', 'decommission');
          this.dataService.decommission(data[idKey]).subscribe(
            response => {
              if (!response['errors']) {
                this.createMessage('success', 'decommission', data);
                if (this.router.url.indexOf('single-view') >= 0) {
                  this.router.navigateByUrl('admin/resources/centers/view');
                } else {
                  this.router.navigateByUrl(this.router.url);
                }
              } else {
                this.createMessage('error', 'decommission', data);
              }
            },
            error => {
              this.createMessage('error', 'decommission', data);
            }
          );
        }
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
          dynamicObject = {"id":data.id}
        }else if(url === "machines"){
          dynamicObject = {"id":data.id}
        }else if(url === "devices"){
          dynamicObject = {"id":data.id}
        }else if(url === "center-type"){
          if(data.id){
            dynamicObject = {"code":data.id}
          }else{
            dynamicObject = {"code":data.code}
          }
        }else if(url === "blacklisted-words"){
          if(data.id){
            dynamicObject = {"word":data.id}
          }else{
            dynamicObject = {"word":data.word}
          }
        }else if(url === "location"){
          if(data.id){
            dynamicObject = {"code":data.id}
          }else{
            dynamicObject = {"code":data.code}
          }
        }else if(url === "holiday"){
          if(data.id){
            dynamicObject = {"holidayId":data.id}
          }else{
            dynamicObject = {"holidayId":data.holidayId}
          }
        }else if(url === "templates"){
          dynamicObject = {"id":data.id}
        }else if(url === "device-specs"){
          dynamicObject = {"id":data.id}
        }else if(url === "device-types"){
          if(data.id){
            dynamicObject = {"code":data.id}
          }else{
            dynamicObject = {"code":data.code}
          }
        }else if(url === "machine-specs"){
          dynamicObject = {"id":data.id}
        }else if(url === "machine-type"){
          if(data.id){
            dynamicObject = {"code":data.id}
          }else{
            dynamicObject = {"code":data.code}
          }
        }else if(url === "document-type"){
          if(data.id){
            dynamicObject = {"code":data.id}
          }else{
            dynamicObject = {"code":data.code}
          }
        }else if(url === "document-categories"){
          if(data.id){
            dynamicObject = {"code":data.id}
          }else{
            dynamicObject = {"code":data.code}
          }
        }
        
        dynamicObject.isActive = true;
        this.updateData('activate', dynamicObject, data);
      } else {
        this.auditService.audit(19, 'ADM-101', 'activate');
      }
    });
  }

  deactivateCenter(data: any, url: string, idKey: string) {
    if (this.router.url.indexOf('single-view') >= 0) {
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
          dynamicObject = {"id":data.id}
        }else if(url === "machines"){
          dynamicObject = {"id":data.id}
        }else if(url === "devices"){
          dynamicObject = {"id":data.id}
        }else if(url === "center-type"){
          if(data.id){
            dynamicObject = {"code":data.id}
          }else{
            dynamicObject = {"code":data.code}
          }
        }else if(url === "blacklisted-words"){
          if(data.id){
            dynamicObject = {"word":data.id}
          }else{
            dynamicObject = {"word":data.word}
          }
        }else if(url === "location"){
          if(data.id){
            dynamicObject = {"code":data.id}
          }else{
            dynamicObject = {"code":data.code}
          }
        }else if(url === "holiday"){
          if(data.id){
            dynamicObject = {"holidayId":data.id}
          }else{
            dynamicObject = {"holidayId":data.holidayId}
          }
        }else if(url === "templates"){
          dynamicObject = {"id":data.id}
        }else if(url === "device-specs"){
          dynamicObject = {"id":data.id}
        }else if(url === "device-types"){
          if(data.id){
            dynamicObject = {"code":data.id}
          }else{
            dynamicObject = {"code":data.code}
          }
        }else if(url === "machine-specs"){
          dynamicObject = {"id":data.id}
        }else if(url === "machine-type"){
          if(data.id){
            dynamicObject = {"code":data.id}
          }else{
            dynamicObject = {"code":data.code}
          }
        }else if(url === "document-type"){
          if(data.id){
            dynamicObject = {"code":data.id}
          }else{
            dynamicObject = {"code":data.code}
          }
        }else if(url === "document-categories"){
          if(data.id){
            dynamicObject = {"code":data.id}
          }else{
            dynamicObject = {"code":data.code}
          }
        }
        dynamicObject.isActive = false;
        this.updateData('deactivate', dynamicObject, data);
      } else {
        this.auditService.audit(19, 'ADM-103', 'deactivate');
      }
    });
  }

  unmapCenter(data: any, url: string, idKey: string) {
    if(data.regCenterId){
      const filter = new FilterModel('id', 'equals', data.regCenterId);
      this.centerRequest.filters = [filter];
      this.centerRequest.languageCode = "eng";
      this.centerRequest.sort = [];
      this.centerRequest.pagination = { pageStart: 0, pageFetch: 10 };
      let request = new RequestModel(
        appConstants.registrationDeviceCreateId,
        null,
        this.centerRequest
      );
      this.centerService.getRegistrationCentersDetails(request).subscribe(
        response => {
          if (response.response.data) {
            //console.log(response.response.data[0].name);
          }
        }
      );
    }

    this.auditService.audit(9, 'ADM-090', {
      buttonName: 'unassign',
      masterdataName: this.router.url.split('/')[
        this.router.url.split('/').length - 2
      ]
    });
    const obj = {
      case: 'CONFIRMATION',
      title: "Confirm Unassign",
      message: "Do you want to unassign the selected Device from the Registration Center",
      yesBtnTxt: "CONFIRM",
      noBtnTxt: "CANCEL"
    };
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data: obj
    });
    dialogRef.afterClosed().subscribe(response => {   
      if(response){
        /*let url = this.router.url.split('/')[3];*/
        this.auditService.audit(18, 'ADM-100', 'unassign');
        let dynamicObject = data;
        delete dynamicObject.createdBy;
        delete dynamicObject.createdDateTime;
        delete dynamicObject.updatedBy;
        delete dynamicObject.updatedDateTime;
        delete dynamicObject.deletedDateTime;
        delete dynamicObject.isDeleted;
        delete dynamicObject.zone;
        delete dynamicObject.deviceTypeName;
        delete dynamicObject.mapStatus;
        dynamicObject.regCenterId = null;

        const request = new RequestModel(
          appConstants.registrationDeviceCreateId,
          null,
          dynamicObject
        );
        this.dataService.updateData(dynamicObject).subscribe(
          response => {
            let obj = {};
            if (!response.errors || response.errors.length === 0) {
              obj = {
                title: "Success",
                message: "Success! You have unassigned Device "+dynamicObject.name+" from Registration Center successfully",
                btnTxt: "Ok",
                width: '650px'
              };
              this.showMessage(obj);
              this.router.navigateByUrl(this.router.url);
            } else {
              /*obj = {
                title: "Error",
                message: this.actionMessages[listItem]['error-message'][0] + data + this.actionMessages[listItem]['error-message'][1],
                btnTxt: "Ok"
              };*/
              this.showMessage(obj);
            }
          }
        );
      }      
    }); 
  }

  unmapMachineCenter(data: any, url: string, idKey: string) {
    this.auditService.audit(9, 'ADM-090', {
      buttonName: 'unassign',
      masterdataName: this.router.url.split('/')[
        this.router.url.split('/').length - 2
      ]
    });
    const obj = {
      case: 'CONFIRMATION',
      title: "Confirm Unassign",
      message: "Do you want to unassign the selected Machine from the Registration Center",
      yesBtnTxt: "CONFIRM",
      noBtnTxt: "CANCEL"
    };
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data: obj
    });
    dialogRef.afterClosed().subscribe(response => {   
      if(response){
        /*let url = this.router.url.split('/')[3];*/
        this.auditService.audit(18, 'ADM-100', 'unassign');
        let dynamicObject = data;
        delete dynamicObject.createdBy;
        delete dynamicObject.createdDateTime;
        delete dynamicObject.updatedBy;
        delete dynamicObject.updatedDateTime;
        delete dynamicObject.deletedDateTime;
        delete dynamicObject.isDeleted;
        delete dynamicObject.zone;
        delete dynamicObject.machineTypeName;
        delete dynamicObject.mapStatus;
        dynamicObject.regCenterId = null;

        const request = new RequestModel(
          appConstants.registrationDeviceCreateId,
          null,
          dynamicObject
        );
        this.dataService.updateData(request).subscribe(
          response => {
            let obj = {};
            if (!response.errors || response.errors.length === 0) {
              obj = {
                title: "Success",
                message: "Success! You have unassigned Machine "+dynamicObject.name+" from Registration Center successfully",
                btnTxt: "Ok",
                width: '650px'
              };
              this.showMessage(obj);
              this.router.navigateByUrl(this.router.url);
            } else {
              /*obj = {
                title: "Error",
                message: this.actionMessages[listItem]['error-message'][0] + data + this.actionMessages[listItem]['error-message'][1],
                btnTxt: "Ok"
              };*/
              this.showMessage(obj);
            }
          }
        );
      }      
    }); 
  }
}
