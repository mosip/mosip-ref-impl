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
import { StatusPipe } from 'src/app/shared/pipes/status.pipe';
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
import {
  MatKeyboardRef,
  MatKeyboardComponent,
  MatKeyboardService
} from 'ngx7-material-keyboard';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent{
  primaryLang: string;
  isPrimaryLangRTL: boolean;
  dropDownValues = new CenterDropdown();
  allSlots: string[];
  disableForms: boolean;
  headerObject: HeaderModel;
  DeviceRequest = {} as DeviceRequest;
  createUpdate = false;
  filterGroup = new FormGroup({});
  primaryData: any;
  subscribed: any;
  deviceSearchModel = {} as DeviceRequest;
  errorMessages: any;
  primaryForm: FormGroup;
  data = [];
  popupMessages: any;

  selectedField: HTMLElement;
  private keyboardRef: MatKeyboardRef<MatKeyboardComponent>;
  @ViewChildren('keyboardRef', { read: ElementRef })
  private attachToElementMesOne: any;

  primaryKeyboard: string;

  keyboardType: string;

  days = [];

  holidayDate: any;
  minDate = new Date();

  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataStorageService: DataStorageService,
    private translateService: TranslateService,
    private headerService: HeaderService,
    private keyboardService: MatKeyboardService,
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
    this.primaryKeyboard = appConstants.keyboardMapping[this.primaryLang];
    this.isPrimaryLangRTL = false;
    let allRTLLangs = this.appConfigService.getConfig()['rightToLeftOrientation'].split(',');
    let filteredList = allRTLLangs.filter(langCode => langCode == this.primaryLang);
    if (filteredList.length > 0) {
      this.isPrimaryLangRTL = true;
    }
  }

  scrollPage(
    element: HTMLElement,
    type: string,
    formControlName: string,
    index: number
  ) {
    element.scrollIntoView({ block: 'center', inline: 'nearest' });
    this.selectedField = element;
    if (this.keyboardRef) {
      this.keyboardRef.instance.setInputInstance(
        this.attachToElementMesOne._results[index]
      );
      if (type === 'primary') {
        this.keyboardRef.instance.attachControl(
          this.primaryForm.controls[formControlName]
        );
      }  
    }
  }

  openKeyboard(type: string) {
    if (this.keyboardService.isOpened && this.keyboardType === type) {
      this.keyboardService.dismiss();
      this.keyboardRef = undefined;
    } else {
      this.keyboardType = type;
      if (type === 'primary') {
        this.keyboardRef = this.keyboardService.open(this.primaryKeyboard);
      } 
      if (this.selectedField) {
        this.selectedField.focus();
      }
    }
  }

  initializeComponent() {
    this.days = appConstants.days[this.primaryLang];
    this.activatedRoute.params.subscribe(params => {
      const routeParts = this.router.url.split('/');
      if (routeParts[routeParts.length - 2] === 'single-view') {
        this.auditService.audit(8, deviceSpecFile.auditEventIds[1], 'devices');
        this.disableForms = true;
        this.getData(params);
      } else {
        this.disableForms = false;
        this.auditService.audit(20, 'ADM-130');
        this.initializeheader();
      }
    });
    this.getDevicespecifications();
    this.getZoneData();
    this.initializePrimaryForm();
    //this.getCenterDetails();  
    this.translateService
      .getTranslation(this.primaryLang)
      .subscribe(response => {
        this.popupMessages = response.devices.popupMessages;
      });
  }

  captureDropDownValue(event: any, formControlName: string, type: string) {
    if (event.source.selected) {
      this.primaryForm.controls.regCenterId.setValue('');
      this.getCenterDetails(event.source.value);
    }
  }

  getCenterDetails(zoneCode: string) {    
    this.dataStorageService
      .getFiltersCenterDetailsBasedonZone(this.primaryLang, zoneCode)
      .subscribe(response => {
        this.dropDownValues.regCenterCode.primary = response.response.registrationCenters;        
      });
  }

  getDevicespecifications() {
    const filterObject = new FilterValuesModel('name', 'unique', '');
    let optinalFilterObject = new OptionalFilterValuesModel('isActive', 'equals', 'true');
    let filterRequest = new FilterRequest([filterObject], this.primaryLang, [optinalFilterObject]);
    let request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('devicespecifications', request)
      .subscribe(response => {
        this.dropDownValues.deviceTypeCode.primary = response.response.filters;
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
    const routeParts = this.router.url.split('/');
    let id = [];
    if (this.disableForms) {
      id = [{ value: '', disabled: true }];
    }else{
      id = [''];
    }
    this.primaryForm = this.formBuilder.group({
      id: id,
      name: ['', [Validators.required]],
      serialNumber: ['', [Validators.required]],
      macAddress: ['', [Validators.required]],
      ipAddress: [''],
      validity: [''],
      zone: ['', [Validators.required]],
      deviceSpecId: ['', [Validators.required]],
      regCenterId: ['']
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

  canDeactivate(): Observable<any> | boolean {
    if (this.keyboardService.isOpened) {
      this.keyboardService.dismiss();
    }
    this.subscribed.unsubscribe();
    if (
      (this.primaryForm.touched) &&
      !this.createUpdate
    ) {
      return this.dialog
        .open(DialogComponent, {
          width: '350px',
          data: {
            case: 'CONFIRMATION',
            title: this.popupMessages['navigation-popup'].title,
            message: this.popupMessages['navigation-popup'].message,
            yesBtnTxt: this.popupMessages['navigation-popup'].yesBtnTxt,
            noBtnTxt: this.popupMessages['navigation-popup'].noBtnTxt
          }
        })
        .afterClosed();
    } else {
      return true;
    }
  }

  submit() {
    console.log(`submit ${this.disableForms}`);
    if (!this.disableForms) {
      this.auditService.audit(17, 'ADM-097');
      console.log(this.primaryForm.valid);
      if (this.primaryForm.valid) {
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
      this.primaryForm.controls.name.value,
      this.primaryForm.controls.macAddress.value,
      this.primaryForm.controls.serialNumber.value,
      this.primaryForm.controls.deviceSpecId.value,
      this.primaryForm.controls.validity.value != "" ? this.primaryForm.controls.validity.value: null, 
      this.primaryForm.controls.ipAddress.value != "" ?this.primaryForm.controls.ipAddress.value: null,
      this.primaryForm.controls.regCenterId.value != "" ? this.primaryForm.controls.regCenterId.value: null,
      this.primaryForm.controls.id.value,           
      false   
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
              this.router.navigateByUrl('admin/resources/devices/view');
            });  
        } else {
          this.showMessage('create-error', createResponse);
        }
      });
  }


  updateData() {
    this.createUpdate = true;
    
    const primaryObject = new DeviceModel(
      this.primaryForm.controls.zone.value,
      this.primaryForm.controls.name.value,
      this.primaryForm.controls.macAddress.value,
      this.primaryForm.controls.serialNumber.value,
      this.primaryForm.controls.deviceSpecId.value,
      this.primaryForm.controls.validity.value != "" ? this.primaryForm.controls.validity.value: null, 
      this.primaryForm.controls.ipAddress.value != "" ?this.primaryForm.controls.ipAddress.value: null,
      this.primaryForm.controls.regCenterId.value != "" ? this.primaryForm.controls.regCenterId.value: null,
      this.data[0].id
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
            this.router.navigateByUrl('admin/resources/devices/view');
          });
        } else {
          this.showMessage('update-error', updateResponse);
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
    this.deviceService.getRegistrationDevicesDetails(request).subscribe(
      response => {
        if (response.response.data) {
          this.data[0] = response.response.data[0];
          this.initializeheader();
          this.setPrimaryFormValues();
          this.disableForms = false;
          //this.primaryForm.enable();
        } else {
          this.showErrorPopup();
        }
      },
      error => this.showErrorPopup()
    );
  }

  setPrimaryFormValues() {
    this.primaryForm.controls.zone.setValue(this.data[0].zoneCode);
    this.primaryForm.controls.validity.setValue(this.data[0].validityDateTime);
    this.primaryForm.controls.name.setValue(this.data[0].name);    
    this.primaryForm.controls.macAddress.setValue(this.data[0].macAddress);
    this.primaryForm.controls.serialNumber.setValue(this.data[0].serialNum);
    this.primaryForm.controls.ipAddress.setValue(this.data[0].ipAddress);
    this.primaryForm.controls.deviceSpecId.setValue(this.data[0].deviceSpecId);
    this.primaryForm.controls.regCenterId.setValue(this.data[0].regCenterId);
    this.primaryForm.controls.id.setValue(this.data[0].id);
  }

  showMessage(type: string, data?: any) {
    let message = "";
    if(type === 'create-success' || type === 'update-success'){
      message = this.popupMessages[type].message[0] + data.id + this.popupMessages[type].message[1] + data.name;
    }else{
      message = data.errors[0].message;
    }
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages[type].title,
        message: message,
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
        this.router.navigateByUrl(`admin/resources/devices/view`)
      );
  }
}
