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
import * as deviceSpecFile from '../../../../../assets/entity-spec/devices.json';
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
  //secondaryLanguageLabels: any;
  primaryLang: string;
  isPrimaryLangRTL: boolean;
  //secondaryLang: string;
  dropDownValues = new CenterDropdown();
  allSlots: string[];
  disableForms: boolean;
  headerObject: HeaderModel;
  DeviceRequest = {} as DeviceRequest;
  createUpdate = false;
  //showSecondaryForm: boolean;
  //secondaryObject: any;
  filterGroup = new FormGroup({});
  
  primaryData: any;
  //secondaryData: any;

  subscribed: any;

  deviceSearchModel = {} as DeviceRequest;

  errorMessages: any;

  primaryForm: FormGroup;

  data = [];
  popupMessages: any;

  selectedField: HTMLElement;

  private attachToElementMesOne: any;

  days = [];
  holidayDate: any;
  minDate = new Date();

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
    this.days = appConstants.days[this.primaryLang];
    this.activatedRoute.params.subscribe(params => {
      const routeParts = this.router.url.split('/');
      if (routeParts[routeParts.length - 2] === 'single-view') {
        this.auditService.audit(8, deviceSpecFile.auditEventIds[1], 'users');
        this.disableForms = true;
        this.getData(params);
      } else {
        this.disableForms = false;
        this.auditService.audit(20, 'ADM-130');
        this.initializeheader();
      }
    });
    this.getUserDetails();
    this.getZoneData();    
    this.getCenterDetails();  
    this.initializePrimaryForm();
    this.translateService
      .getTranslation(this.primaryLang)
      .subscribe(response => {
        this.popupMessages = response.devices.popupMessages;
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
        this.dropDownValues.deviceTypeCode.primary = response.response.mosipUserDtoList;
      });
  }

  getCenterDetails() {
    const filterObject = new FilterValuesModel('name', 'unique', '');
    let optinalFilterObject = new OptionalFilterValuesModel('isActive', 'equals', 'true');
    let filterRequest = new FilterRequest([filterObject], this.primaryLang, [optinalFilterObject]);

    let request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('registrationcenters', request)
      .subscribe(response => {
        this.dropDownValues.regCenterCode.primary = response.response.filters;
      });
  }

  getZoneData() {
    this.dataStorageService
      .getZoneData(this.primaryLang)
      .subscribe(response => {
        console.log(response);
        this.dropDownValues.zone.primary = response.response;
        if (this.dropDownValues.zone.primary.length === 1) {
          this.primaryForm.controls.zone.setValue(
            this.dropDownValues.zone.primary[0].code
          );
          this.primaryForm.controls.zone.disable();
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

  initializePrimaryForm() {
    this.primaryForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      zone: ['', [Validators.required]],
      regCenterId: ['', [Validators.required]]
    });
  }

  cancel() {
    this.location.back();
  }

  get primary() {
    return this.primaryForm.controls;
  }

  showError() {
    this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        case: 'MESSAGE'
      },
      disableClose: true
    }).afterClosed().subscribe(() => this.router.navigateByUrl('admin/resources/devices/view'));
  }

  setPrimaryData() {
    this.primaryForm.controls.name.setValue(this.primaryData.name);
    this.primaryForm.controls.serialNumber.setValue(this.primaryData.serialNum);
    this.primaryForm.controls.macAddress.setValue(this.primaryData.macAddress);
    this.primaryForm.controls.ipAddress.setValue(this.primaryData.ipAddress);
    this.primaryForm.controls.validity.setValue(
      Utils.formatDate(this.primaryData.validityDateTime)
    );
    this.primaryForm.controls.zone.setValue(this.primaryData.zone);
    this.primaryForm.controls.publicKey.setValue(this.primaryData.publicKey);
  }

  setHeaderData() {
    this.headerObject = new HeaderModel(
      this.primaryData.name,
      this.primaryData.createdDateTime ? this.primaryData.createdDateTime : '-',
      this.primaryData.createdBy ? this.primaryData.createdBy : '-',
      this.primaryData.updatedDateTime ? this.primaryData.updatedDateTime : '-',
      this.primaryData.updatedBy ? this.primaryData.updatedBy : '-'
    );
    console.log(this.headerObject);
  }

  ngOnDestroy() {
    this.subscribed.unsubscribe();
  }

  submit() {
    console.log(`submit ${this.disableForms}`);
    if (!this.disableForms) {
      this.auditService.audit(17, 'ADM-097');
      console.log(this.primaryForm.valid);
      if (this.primaryForm.valid) {
        console.log("calling on create");
        this.onCreate();
      } else {
        for (const i in this.primaryForm.controls) {
          if (this.primaryForm.controls[i]) {
            this.primaryForm.controls[i].markAsTouched();
          }
        }
      }
    } else {
      this.disableForms = false;
      this.primaryForm.enable();
    }
  }

  onCreate() {
    let data = {};
    console.log(this.data);
    if (this.data.length === 0) {
      data = {
        case: 'CONFIRMATION',
        title: this.popupMessages['create'].title,
        message: this.popupMessages['create'].message[0]+ this.primaryForm.controls.name.value + this.popupMessages['create'].message[1],
        yesBtnTxt: this.popupMessages['create'].yesBtnText,
        noBtnTxt: this.popupMessages['create'].noBtnText
      };
    } else {
      data = {
        case: 'CONFIRMATION',
        title: this.popupMessages['edit'].title,
        message: this.popupMessages['edit'].message,
        yesBtnTxt: this.popupMessages['edit'].yesBtnText,
        noBtnTxt: this.popupMessages['edit'].noBtnText
      };
    }
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response && this.data.length === 0) {
        this.auditService.audit(18, 'ADM-104', 'create');
        this.saveData();
      } else if (response && this.data.length !== 0) {
        this.auditService.audit(18, 'ADM-105', 'edit');
        this.updateData();
      } else if (!response && this.data.length === 0) {
        this.auditService.audit(19, 'ADM-106', 'create');
      } else if (!response && this.data.length !== 0) {
        this.auditService.audit(19, 'ADM-107', 'edit');
      }
    });
  }

  saveData() {
    this.createUpdate = true;
    const primaryObject = new DeviceModel(
      this.primaryForm.controls.zone.value,
      this.primaryForm.controls.validity.value, 
      this.primaryForm.controls.name.value,
      this.primaryForm.controls.macAddress.value,
      this.primaryForm.controls.serialNumber.value,
      this.primaryForm.controls.ipAddress.value,
      this.primaryLang,
      this.primaryForm.controls.deviceSpecId.value,
      this.primaryForm.controls.regCenterId.value,
      "",           
      false
      //this.primaryForm.controls.isActive.value
    );
    
    const primaryRequest = new RequestModel(
      appConstants.registrationDeviceCreateId,
      null,
      primaryObject
    );
    this.dataStorageService
      .createDevice(primaryRequest)
      .subscribe(createResponse => {
        if (!createResponse.errors) {
          this.showMessage('create-success', createResponse.response)
            .afterClosed()
            .subscribe(() => {
              this.primaryForm.reset();
              this.router.navigateByUrl('admin/resources/users/view');
            }); 
        } else {
          this.showMessage('create-error');
        }
      });
  }


  updateData() {
    this.createUpdate = true;
    const primaryObject = new DeviceModel(
      this.primaryForm.controls.zone.value,
      this.primaryForm.controls.validity.value, 
      this.primaryForm.controls.name.value,
      this.primaryForm.controls.macAddress.value,
      this.primaryForm.controls.serialNumber.value,
      this.primaryForm.controls.ipAddress.value,
      this.primaryLang,
      this.primaryForm.controls.deviceSpecId.value,
      this.primaryForm.controls.regCenterId.value,
      this.data[0].id,      
    );
   
    const primaryRequest = new RequestModel(
      appConstants.registrationDeviceCreateId,
      null,
      primaryObject
    );
    this.dataStorageService
      .updateData(primaryRequest)
      .subscribe(updateResponse => {
        if (!updateResponse.errors) {
          this.showMessage('update-success', updateResponse.response)
          .afterClosed()
          .subscribe(() => {
            this.primaryForm.reset();
            //this.secondaryForm.reset();
            this.router.navigateByUrl('admin/resources/users/view');
          });
        } else {
          this.showMessage('update-error');
        }
      });
  }

  async getData(params: any) {
    const filter = new FilterModel('id', 'equals', params.id);
    this.DeviceRequest.filters = [filter];
    this.DeviceRequest.languageCode = this.primaryLang;
    this.DeviceRequest.sort = [];
    this.DeviceRequest.pagination = { pageStart: 0, pageFetch: 10 };
    let request = new RequestModel(
      appConstants.registrationDeviceCreateId,
      null,
      this.DeviceRequest
    );
    this.dataStorageService.getUsersData(request).subscribe(
      response => {
        if (response.response.data) {
          this.data[0] = response.response.data[0];
          this.initializeheader();
          this.setPrimaryFormValues();
              this.disableForms = false;
              this.primaryForm.enable();
        } else {
          this.showErrorPopup();
        }
      },
      error => this.showErrorPopup()
    );
  }

  setPrimaryFormValues() {
  	console.log("this.primaryData>>>"+this.primaryData);
    /*this.primaryData["zone"] = this.data[0].zoneCode;
    this.primaryData["userId"] = this.data[0].name; 
    this.primaryData["regCenterId"] = this.data[0].regCenterId;*/
  }

  showMessage(type: string, data?: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages[type].title,
        message:
          type === 'create-success' || type === 'update-success'
            ? this.popupMessages[type].message[0] +
              data.id +
              this.popupMessages[type].message[1] +
              data.name
            : this.popupMessages[type].message,
        btnTxt: this.popupMessages[type].btnTxt
      }
    });
    return dialogRef;
  }

  showErrorPopup() {
    this.dialog
      .open(DialogComponent, {
        width: '350px',
        data: {
          case: 'MESSAGE',
          // tslint:disable-next-line:no-string-literal
          title: this.popupMessages['noData']['title'],
          message: this.popupMessages['noData']['message'],
          // tslint:disable-next-line:no-string-literal
          btnTxt: this.popupMessages['noData']['btnTxt']
        },
        disableClose: true
      })
      .afterClosed()
      .subscribe(() =>
        this.router.navigateByUrl(`admin/resources/users/view`)
      );
  }
}
