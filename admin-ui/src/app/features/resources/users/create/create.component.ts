import { Component, ViewEncapsulation, ElementRef, ViewChildren} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AppConfigService } from 'src/app/app-config.service';
import { DeviceRequest } from 'src/app/core/models/deviceRequest.model';
import { FilterModel } from 'src/app/core/models/filter.model';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { RequestModel } from 'src/app/core/models/request.model';
import * as appConstants from '../../../../app.constants';
import { HeaderModel } from 'src/app/core/models/header.model';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import * as userSpecFile from '../../../../../assets/entity-spec/user.json';
import { AuditService } from 'src/app/core/services/audit.service';
import { Observable } from 'rxjs';
import { FilterRequest } from 'src/app/core/models/filter-request.model';
import { FilterValuesModel } from 'src/app/core/models/filter-values.model';
import { OptionalFilterValuesModel } from 'src/app/core/models/optional-filter-values.model';
import { Location } from '@angular/common';
import { CenterDropdown } from 'src/app/core/models/center-dropdown';
import Utils from '../../../../app.utils';

import { DeviceModel } from 'src/app/core/models/device.model';
import { HeaderService } from 'src/app/core/services/header.service';
import { DeviceService } from 'src/app/core/services/devices.service';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent{
  primaryLang: string;
  isPrimaryLangRTL: boolean;
  dropDownValues = new CenterDropdown(); 
  headerObject: HeaderModel;
  createUpdate = false;
  filterGroup = new FormGroup({});  
  primaryData: any;
  subscribed: any;
  errorMessages: any;
  popupMessages: any;
  DeviceRequest = {} as DeviceRequest;
  data = [];
  pageName = "";
  disabled = true;

  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appService: AppConfigService,
    private dataStorageService: DataStorageService,
    private translateService: TranslateService,
    private headerService: HeaderService,
    private dialog: MatDialog,
    private appConfigService: AppConfigService,
    private auditService: AuditService,
    private deviceService: DeviceService,
  ) {
    this.subscribed = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {     
        this.initializeComponent();
      }
    });
    this.primaryLang = this.headerService.getUserPreferredLanguage();
    translateService.use(this.primaryLang);
    this.isPrimaryLangRTL = false;
    let allRTLLangs = this.appConfigService.getConfig()['rightToLeftOrientation'].split(',');
    let filteredList = allRTLLangs.filter(langCode => langCode == this.primaryLang);
    if (filteredList.length > 0) {
      this.isPrimaryLangRTL = true;
    }
  }

  initializeComponent() {
    this.pageName = this.router.url.split('/')[3];
    if(this.pageName === "zoneuser"){
      this.disabled = false;
    }
    this.activatedRoute.params.subscribe(params => {
      const routeParts = this.router.url.split('/');
      if (routeParts[routeParts.length - 2] === 'single-view') {
        this.auditService.audit(8, userSpecFile.auditEventIds[1], 'users');
        this.createUpdate = true;
        this.getData(params);
      } else {
        this.auditService.audit(20, 'ADM-130');
        this.initializeheader();
        this.primaryData = {userId:"", zone:"", regCenterId:"", name: ""}
      }
    });
    this.getUserDetails();
    this.getZoneData();
    this.translateService
      .getTranslation(this.primaryLang)
      .subscribe(response => {
        this.popupMessages = response.devices.popupMessages;
      });
  }

  captureDropDownValue(event: any, formControlName: string) {
    if (event.source.selected) {
      this.primaryData[formControlName] = event.source.value;
      if(formControlName === "zone"){
        this.getCenterDetails(event.source.value);
      }else if(formControlName === "userId"){
        this.primaryData['name'] = event.source.viewValue;
      }      
    }
  }

  getCenterDetails(zoneCode: string) {    
    this.dataStorageService
      .getFiltersCenterDetailsBasedonZone(this.primaryLang, zoneCode)
      .subscribe(response => {
        if(!response.errors){
          this.dropDownValues.regCenterCode.primary = response.response.registrationCenters;
        }else{
          this.dropDownValues.regCenterCode.primary = [];
        }
      });
  }

  getUserDetails() {
    const filterObject = new FilterValuesModel('name', 'unique', '');
    let optinalFilterObject = new OptionalFilterValuesModel('isActive', 'equals', 'true');
    let filterRequest = new FilterRequest([filterObject], this.primaryLang, [optinalFilterObject]);
    let request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersUserDetails()
      .subscribe(response => {
        if(response.response.mosipUserDtoList)        
          this.dropDownValues.deviceTypeCode.primary = response.response.mosipUserDtoList.sort((a, b) => a.name.localeCompare(b.name));
      });
  }

  getZoneData() {
    this.dataStorageService
      .getZoneData(this.primaryLang)
      .subscribe(response => {
        console.log(response);
        this.dropDownValues.zone.primary = response.response;
        if (this.dropDownValues.zone.primary.length === 1) {
          this.primaryData.zone = this.dropDownValues.zone.primary[0].code
        }
      });
  }

  initializeheader() {
    if (this.data.length === 0) {
      this.headerObject = new HeaderModel('-', '-', '-', '-', '-', '-', '-');
    } else {
      this.headerObject = new HeaderModel(
        this.data[0].name,
        this.data[0].createdDateTime ? this.data[0].createdDateTime : '-',
        this.data[0].createdBy ? this.data[0].createdBy : '-',
        this.data[0].updatedDateTime ? this.data[0].updatedDateTime : '-',
        this.data[0].updatedBy ? this.data[0].updatedBy : '-',
        this.data[0].id,
        this.data[0].isActive
      );
    }
  }

  cancel() {
    this.location.back();
  }

  showError() {
    this.dialog.open(DialogComponent, {
      width: '650px',
      data: {
        case: 'MESSAGE'
      },
      disableClose: true
    }).afterClosed().subscribe(() => this.router.navigateByUrl('admin/resources/devices/view'));
  }

  ngOnDestroy() {
    this.subscribed.unsubscribe();
  }

  submit() {
    let zoneData = {"isActive": true, "langCode": this.primaryLang, "userId": this.primaryData.userId, "zoneCode": this.primaryData.zone};
    let centerData = {"isActive": true, "langCode": this.primaryLang, "id": this.primaryData.userId, "regCenterId": this.primaryData.regCenterId, "name":this.primaryData.name};
    let url = this.router.url.split('/')[3];
    let request = new RequestModel(
      "",
      null,
      zoneData
    );
    if(this.createUpdate){
      this.dataStorageService.updateZoneUserMapping(request).subscribe(zoneResponse => { 
        if (!zoneResponse.errors) {
          if(url !== "zoneuser"){
            request = new RequestModel("", null, centerData);
            this.dataStorageService.updateCenterUserMapping(request).subscribe(centerResponse => {
              if (!centerResponse.errors) {
                  let url = centerData.name+" Mapped Successfully";
                  this.showMessage(url)
                    .afterClosed()
                    .subscribe(() => {
                      if(url === "zoneuser"){
                        this.router.navigateByUrl(`admin/resources/zoneuser/view`);
                      }else{
                        this.router.navigateByUrl(`admin/resources/users/view`);
                      }
                    });
                } else {
                  this.showErrorPopup(centerResponse.errors[0].message);
                }        
            });
          } else {
            let url = centerData.name+" Mapped Successfully";
            this.showMessage(url)
              .afterClosed()
              .subscribe(() => { 
                this.router.navigateByUrl(`admin/resources/zoneuser/view`);                                
              });
          } 
        } else {
          this.showErrorPopup(zoneResponse.errors[0].message);
        } 
      });
    }else{
      this.dataStorageService.createZoneUserMapping(request).subscribe(zoneResponse => { 
        if (!zoneResponse.errors) {
          if(url !== "zoneuser"){
            request = new RequestModel("", null, centerData);
            this.dataStorageService.createCenterUserMapping(request).subscribe(centerResponse => {
              if (!centerResponse.errors) {
                  let url = centerData.name+" Mapped Successfully";
                  this.showMessage(url)
                    .afterClosed()
                    .subscribe(() => {                  
                      if(url === "zoneuser"){
                        this.router.navigateByUrl(`admin/resources/zoneuser/view`);
                      }else{
                        this.router.navigateByUrl(`admin/resources/users/view`);
                      }                    
                    });
                } else {
                  this.showErrorPopup(centerResponse.errors[0].message);
                }        
            });
          } else {
            let url = centerData.name+" Mapped Successfully";
            this.showMessage(url)
              .afterClosed()
              .subscribe(() => { 
                this.router.navigateByUrl(`admin/resources/zoneuser/view`);                                
              });
          } 
        } else {
          this.showErrorPopup(zoneResponse.errors[0].message);
        } 
      });
    }
  }

  async getData(params: any) {
    let filter = null;
    let url = this.router.url.split('/')[3];
    if(url === "zoneuser"){
      filter = new FilterModel('userId', 'equals', params.id);
    }else{
      filter = new FilterModel('id', 'equals', params.id);
    }
    this.DeviceRequest.filters = [filter];
    this.DeviceRequest.languageCode = this.primaryLang;
    this.DeviceRequest.sort = [];
    this.DeviceRequest.pagination = { pageStart: 0, pageFetch: 10 };
    let request = new RequestModel(
      appConstants.registrationDeviceCreateId,
      null,
      this.DeviceRequest
    );
    let currenturl = this.router.url.split('/')[3];
    this.dataStorageService.getUsersData(request, currenturl).subscribe(
      response => {
        if (response.response.data) {
          this.data = response.response.data;
          if(url === "zoneuser"){
            this.primaryData = {userId:this.data[0].userId, zone:this.data[0].zoneCode, regCenterId:this.data[0].regCenterId, name: this.data[0].userName}
          }else{
            this.primaryData = {userId:this.data[0].id, zone:this.data[0].zoneCode, regCenterId:this.data[0].regCenterId, name: this.data[0].name}
          }
          this.initializeheader();
        } else {
          this.showErrorPopup("No User Details Found");
        }
      },
      error => this.showErrorPopup("No User Details Found")
    );
  }

  showMessage(message: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data: {
        case: 'MESSAGE',
        title: 'Success',
        message: message,
        btnTxt: 'Ok'
      }
    });
    return dialogRef;
  }

  showErrorPopup(message: string) {
    this.dialog
      .open(DialogComponent, {
        width: '350px',
        data: {
          case: 'MESSAGE',
          title: 'Error',
          message: message,
          btnTxt: 'Ok'
        },
        disableClose: true
      });
  }
}
