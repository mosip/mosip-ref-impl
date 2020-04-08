import { Component, OnInit, OnDestroy, ViewEncapsulation, ElementRef, ViewChildren} from '@angular/core';
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
import { Location } from '@angular/common';
import { CenterDropdown } from 'src/app/core/models/center-dropdown';
import Utils from '../../../../app.utils';

import { DeviceModel } from 'src/app/core/models/device.model';
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
  secondaryLanguageLabels: any;
  primaryLang: string;
  secondaryLang: string;
  dropDownValues = new CenterDropdown();
  allSlots: string[];
  disableForms: boolean;
  headerObject: HeaderModel;
  DeviceRequest = {} as DeviceRequest;
  createUpdate = false;
  showSecondaryForm: boolean;
  secondaryObject: any;
  filterGroup = new FormGroup({});
  
  primaryData: any;
  secondaryData: any;

  subscribed: any;

  deviceSearchModel = {} as DeviceRequest;

  errorMessages: any;

  primaryForm: FormGroup;
  secondaryForm: FormGroup;

  data = [];
  popupMessages: any;

  selectedField: HTMLElement;

  private keyboardRef: MatKeyboardRef<MatKeyboardComponent>;
  @ViewChildren('keyboardRef', { read: ElementRef })
  private attachToElementMesOne: any;

  primaryKeyboard: string;
  secondaryKeyboard: string;

  keyboardType: string;

  days = [];
  secondaryDays = [];

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
    private keyboardService: MatKeyboardService,
    private dialog: MatDialog,
    private statusPipe: StatusPipe,
    private auditService: AuditService,
    private deviceService: DeviceService,
  ) {
    this.subscribed = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
     
        this.initializeComponent();
      }
    });
    // tslint:disable-next-line:no-string-literal
    this.primaryLang = appService.getConfig()['primaryLangCode'];
    // tslint:disable-next-line:no-string-literal
    this.secondaryLang = appService.getConfig()['secondaryLangCode'];
    this.primaryLang === this.secondaryLang ? this.showSecondaryForm = false : this.showSecondaryForm = true;   
    translateService.use(this.primaryLang);
    this.primaryKeyboard = appConstants.keyboardMapping[this.primaryLang];
    this.secondaryKeyboard = appConstants.keyboardMapping[this.secondaryLang];
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
      } else if (type === 'secondary') {
        this.keyboardRef.instance.attachControl(
          this.secondaryForm.controls[formControlName]
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
      } else if (type === 'secondary') {
        this.keyboardRef = this.keyboardService.open(this.secondaryKeyboard);
      }
      if (this.selectedField) {
        this.selectedField.focus();
      }
    }
  }

  initializeComponent() {
    this.days = appConstants.days[this.primaryLang];
    this.secondaryDays = appConstants.days[this.secondaryLang];
    this.activatedRoute.params.subscribe(params => {
      const routeParts = this.router.url.split('/');
      if (routeParts[routeParts.length - 2] === 'single-view') {
        this.auditService.audit(8, deviceSpecFile.auditEventIds[1], 'devices');
        this.disableForms = false;
        this.getData(params);
      } else {
        this.auditService.audit(20, 'ADM-130');
        this.initializeheader();
      }
    });
    this.translateService
      .getTranslation(this.secondaryLang)
      .subscribe(response => {
        this.secondaryLanguageLabels = response.devices;
        console.log(this.secondaryLanguageLabels);
<<<<<<< HEAD
      });
    this.getDevicespecifications();
    this.getZoneData();
    this.initializePrimaryForm();
    this.initializeSecondaryForm();    
    this.translateService
      .getTranslation(this.primaryLang)
      .subscribe(response => {
        this.popupMessages = response.devices.popupMessages;
      });
  }

  getDevicespecifications() {
    const filterObject = new FilterValuesModel('name', 'unique', '');
    let filterRequest = new FilterRequest([filterObject], this.primaryLang);
    let request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('devicespecifications', request)
      .subscribe(response => {
        this.dropDownValues.deviceTypeCode.primary = response.response.filters;
      });
    filterRequest = new FilterRequest([filterObject], this.secondaryLang);
    request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('devicespecifications', request)
      .subscribe(response => {
        this.dropDownValues.deviceTypeCode.secondary =
          response.response.filters;
      });
=======
      });
    this.getDevicespecifications();
    this.getZoneData();
    this.initializePrimaryForm();
    this.initializeSecondaryForm();    
    this.translateService
      .getTranslation(this.primaryLang)
      .subscribe(response => {
        this.popupMessages = response.devices.popupMessages;
      });
  }

  getDevicespecifications() {
    const filterObject = new FilterValuesModel('name', 'unique', '');
    let filterRequest = new FilterRequest([filterObject], this.primaryLang);
    let request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('devicespecifications', request)
      .subscribe(response => {
        this.dropDownValues.deviceTypeCode.primary = response.response.filters;
      });
    filterRequest = new FilterRequest([filterObject], this.secondaryLang);
    request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('devicespecifications', request)
      .subscribe(response => {
        this.dropDownValues.deviceTypeCode.secondary =
          response.response.filters;
      });
>>>>>>> Master UI screen dev
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
    if (this.primaryLang !==  this.secondaryLang) {
      this.dataStorageService
      .getZoneData(this.secondaryLang)
      .subscribe(response => {
        console.log(response);
        this.dropDownValues.zone.secondary = response.response;
        if (this.dropDownValues.zone.secondary.length === 1) {
          this.secondaryForm.controls.zone.setValue(
            this.dropDownValues.zone.secondary[0].code
          );
          this.secondaryForm.controls.zone.disable();
        }
      });
    }
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
      serialNumber: ['', [Validators.required]],
      macAddress: ['', [Validators.required]],
      ipAddress: ['', [Validators.required]],
      validity: ['', [Validators.required]],
      isActive: [{ value: false, disabled: true }],
      zone: ['', [Validators.required]],
      deviceSpecId: ['', [Validators.required]]
    });
  }

  initializeSecondaryForm() {
    this.secondaryForm = this.formBuilder.group({
      name: [''],
      serialNumber: [''],
      macAddress: [''],
      ipAddress: [''],
<<<<<<< HEAD
      validity: [{ value: '', disabled: true }],
      zone: [{ value: '', disabled: true }],
      deviceSpecId: [{ value: '', disabled: true }],
      isActive: [{ value: true, disabled: true }]
=======
      validity: [''],
      isActive: [{ value: false, disabled: true }],
      zone: [''],
      deviceSpecId: ['', [Validators.required]]
>>>>>>> Master UI screen dev
    });
  }

  cancel() {
    this.location.back();
  }

  get primary() {
    return this.primaryForm.controls;
  }

  get secondary() {
    return this.secondaryForm.controls;
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
    this.primaryForm.controls.isActive.setValue(this.statusPipe.transform(this.primaryData.isActive));
    this.primaryForm.controls.zone.setValue(this.primaryData.zone);
    this.primaryForm.controls.publicKey.setValue(this.primaryData.publicKey);
  }

  setSecondaryData() {
    this.secondaryForm.controls.name.setValue(this.secondaryData.name);
    this.secondaryForm.controls.serialNumber.setValue(
      this.secondaryData.serialNum
    );
    this.secondaryForm.controls.macAddress.setValue(
      this.secondaryData.macAddress
    );
    this.secondaryForm.controls.ipAddress.setValue(
      this.secondaryData.ipAddress
    );
    this.secondaryForm.controls.validity.setValue(
      this.secondaryData.validityDateTime
    );
    this.secondaryForm.controls.isActive.setValue(this.statusPipe.transform(this.secondaryData.isActive));
    this.secondaryForm.controls.zone.setValue(this.secondaryData.zone);
    this.secondaryForm.controls.publicKey.setValue(this.secondaryData.publicKey);
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
      (this.primaryForm.touched || this.secondaryForm.touched) &&
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
    if (!this.disableForms) {
      this.auditService.audit(17, 'ADM-097');
      this.onCreate();
      /*if (this.primaryForm.valid) {
        for (const i in this.secondaryForm.controls) {
          if (this.secondaryForm.controls[i]) {
            this.secondaryForm.controls[i].markAsTouched();
          }
        }
        this.onCreate();
      } else {
        for (const i in this.primaryForm.controls) {
          if (this.primaryForm.controls[i]) {
            this.primaryForm.controls[i].markAsTouched();
            this.secondaryForm.controls[i].markAsTouched();
          }
        }
      }*/
    } else {
      this.disableForms = false;
      this.primaryForm.enable();
      if (this.showSecondaryForm) {
        this.initializeSecondaryForm();
      }
    }
  }

  onCreate() {
    console.log("onCreate>>>"+this.secondaryForm.controls.name.value);
    let data = {};
    if (this.secondaryForm.controls.name.value === '' && this.showSecondaryForm
    ) {
      data = {
        case: 'CONFIRMATION',
        title: this.popupMessages['create'].title,
        message: this.popupMessages['create'].mandatorySecondaryFields,
        yesBtnTxt: this.popupMessages['create'].yesBtnText,
        noBtnTxt: this.popupMessages['create'].noBtnText
      };
    } else {
      if (this.data.length === 0) {

      } else {
        data = {
          case: 'CONFIRMATION',
          title: this.popupMessages['edit'].title,
          message: this.popupMessages['edit'].message,
          yesBtnTxt: this.popupMessages['edit'].yesBtnText,
          noBtnTxt: this.popupMessages['edit'].noBtnText
        };
      }
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

  copyDataToSecondaryForm(fieldName: string, value: string) {
    if (this.primaryForm.controls[fieldName].valid) {
      this.secondaryForm.controls[fieldName].setValue(value);
    } else {
      this.secondaryForm.controls[fieldName].setValue('');
    }
  }
  
<<<<<<< HEAD
  captureDatePickerValue(event: any, fieldName: string, type: string) {
    if (this.primaryForm.controls[fieldName].valid) {
      this.secondaryForm.controls[fieldName].setValue(event.target.value);
    } else {
      this.secondaryForm.controls[fieldName].setValue('');
    }
  }

=======
>>>>>>> Master UI screen dev
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
      "",           
      true,               
    );
    const secondaryObject = new DeviceModel(
      this.secondaryForm.controls.zone.value,
      this.secondaryForm.controls.validity.value,
      this.secondaryForm.controls.name.value,
      this.secondaryForm.controls.macAddress.value,
      this.secondaryForm.controls.serialNumber.value,
      this.secondaryForm.controls.ipAddress.value, 
      this.secondaryLang,
      this.secondaryForm.controls.deviceSpecId.value, 
      "",     
      true,  
    );
    const primaryRequest = new RequestModel(
      appConstants.registrationDeviceCreateId,
      null,
      primaryObject
    );
    this.dataStorageService
      .createDevice(primaryRequest)
      .subscribe(createResponse => {
        console.log('Primary Response' + createResponse);
        if (!createResponse.errors) {
          if (this.secondaryForm.valid) {
            if (this.showSecondaryForm) {
              console.log('inside secondary block');
              secondaryObject.id = createResponse.response.id;
<<<<<<< HEAD
              secondaryObject.isActive = true;
=======
              secondaryObject.isActive = false;
>>>>>>> Master UI screen dev
              const secondaryRequest = new RequestModel(
              appConstants.registrationDeviceCreateId,
              null,
              secondaryObject
            );
              console.log(JSON.stringify(secondaryRequest));
              this.dataStorageService
              .createDevice(secondaryRequest)
              .subscribe(secondaryResponse => {
                console.log('Secondary Response' + secondaryResponse);
                if (!secondaryResponse.errors) {
                  this.showMessage('create-success', createResponse.response)
                    .afterClosed()
                    .subscribe(() => {
                      this.primaryForm.reset();
                      this.secondaryForm.reset();
                      this.router.navigateByUrl('admin/resources/devices/view');
                    });
                } else {
                  this.showMessage('create-error');
                }
              });
            }
          } else {
            this.showMessage('update-success', createResponse.response)
            .afterClosed()
                    .subscribe(() => {
                      this.primaryForm.reset();
                      this.secondaryForm.reset();
                      this.router.navigateByUrl('admin/resources/devices/view');
                    });
          }
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
      this.data[0].id,           
      true,               
    );
    const secondaryObject = new DeviceModel(
      this.secondaryForm.controls.zone.value,
      this.secondaryForm.controls.validity.value,
      this.secondaryForm.controls.name.value,
      this.secondaryForm.controls.macAddress.value,
      this.secondaryForm.controls.serialNumber.value,
      this.secondaryForm.controls.ipAddress.value, 
      this.secondaryLang,
      this.secondaryForm.controls.deviceSpecId.value, 
      this.data[0].id,     
      true,  
    );
    const primaryRequest = new RequestModel(
      appConstants.registrationDeviceCreateId,
      null,
      primaryObject
    );
    this.dataStorageService
      .updateData(primaryRequest)
      .subscribe(updateResponse => {
        console.log('Primary Response' + updateResponse);
        if (!updateResponse.errors) {
          if (this.secondaryForm.valid) {
            if (this.showSecondaryForm) {
              console.log('inside secondary block');
              secondaryObject.id = updateResponse.response.id;
<<<<<<< HEAD
              secondaryObject.isActive = true;
=======
              secondaryObject.isActive = false;
>>>>>>> Master UI screen dev
              const secondaryRequest = new RequestModel(
              appConstants.registrationDeviceCreateId,
              null,
              secondaryObject
            );
              console.log(JSON.stringify(secondaryRequest));
              this.dataStorageService
              .updateData(secondaryRequest)
              .subscribe(secondaryResponse => {
                console.log('Secondary Response' + secondaryResponse);
                if (!secondaryResponse.errors) {
                  this.showMessage('update-success', updateResponse.response)
                    .afterClosed()
                    .subscribe(() => {
                      this.primaryForm.reset();
                      this.secondaryForm.reset();
                      this.router.navigateByUrl('admin/resources/devices/view');
                    });
                } else {
                  this.showMessage('update-error');
                }
              });
            }
          } else {
            this.showMessage('update-success', updateResponse.response)
            .afterClosed()
                    .subscribe(() => {
                      this.primaryForm.reset();
                      this.secondaryForm.reset();
                      this.router.navigateByUrl('admin/resources/devices/view');
                    });
          }
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
    this.deviceService.getRegistrationDevicesDetails(request).subscribe(
      response => {
        if (response.response.data) {
          this.data[0] = response.response.data[0];
          this.initializeheader();
          this.setPrimaryFormValues();
          this.DeviceRequest.languageCode = this.secondaryLang;
          request = new RequestModel(
            appConstants.registrationDeviceCreateId,
            null,
            this.DeviceRequest
          );
          if (this.showSecondaryForm) {
          this.deviceService
            .getRegistrationDevicesDetails(request)
            .subscribe(secondaryResponse => {
              this.data[1] = secondaryResponse.response.data
                ? secondaryResponse.response.data[0]
                : {};
              this.setSecondaryFormValues();
            });
          }
          if (
              this.activatedRoute.snapshot.queryParams.editable === 'true'
            ) {
              this.disableForms = false;
              this.primaryForm.enable();
              if (this.showSecondaryForm) {
              }
            }
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
    this.primaryForm.controls.isActive.setValue(this.data[0].isActive);
  }

  setSecondaryFormValues() {
    this.secondaryForm.controls.zone.setValue(this.data[1].zoneCode);
    this.secondaryForm.controls.validity.setValue(this.data[1].validityDateTime);
    this.secondaryForm.controls.name.setValue(this.data[1].name);    
    this.secondaryForm.controls.macAddress.setValue(this.data[1].macAddress);
    this.secondaryForm.controls.serialNumber.setValue(this.data[1].serialNum);
    this.secondaryForm.controls.ipAddress.setValue(this.data[1].ipAddress);
    this.secondaryForm.controls.deviceSpecId.setValue(this.data[1].deviceSpecId);
    this.secondaryForm.controls.isActive.setValue(this.data[1].isActive);
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
        this.router.navigateByUrl(`admin/resources/devices/view`)
      );
  }
}
