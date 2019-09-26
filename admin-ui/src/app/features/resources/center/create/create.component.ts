import {
  Component,
  OnInit,
  ViewEncapsulation,
  ElementRef,
  ViewChildren
} from '@angular/core';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { CenterDropdown } from 'src/app/core/models/center-dropdown';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Utils from '../../../../app.utils';
import * as appConstants from '../../../../app.constants';
import {
  ValidateLatLong,
  ValidateKiosk
} from 'src/app/core/validators/center.validator';
import { AppConfigService } from 'src/app/app-config.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HeaderModel } from 'src/app/core/models/header.model';
import { CenterModel } from 'src/app/core/models/center.model';
import { RequestModel } from 'src/app/core/models/request.model';
import { CenterService } from 'src/app/core/services/center.service';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { FilterModel } from 'src/app/core/models/filter.model';
import { Observable } from 'rxjs';
import { FilterRequest } from 'src/app/core/models/filter-request.model';
import { FilterValuesModel } from 'src/app/core/models/filter-values.model';
import {
  MatKeyboardRef,
  MatKeyboardComponent,
  MatKeyboardService
} from 'ngx7-material-keyboard';
import { AuditService } from 'src/app/core/services/audit.service';
import * as centerSpecFile from '../../../../../assets/entity-spec/center.json';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent {
  secondaryLanguageLabels: any;
  primaryLang: string;
  secondaryLang: string;
  dropDownValues = new CenterDropdown();
  allSlots: string[];
  disableForms: boolean;
  headerObject: HeaderModel;
  centerRequest = {} as CenterRequest;
  createUpdate = false;

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
  subscribed: any;

  constructor(
    private location: Location,
    private translateService: TranslateService,
    private dataStorageService: DataStorageService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private appConfigService: AppConfigService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private centerService: CenterService,
    private keyboardService: MatKeyboardService,
    private auditService: AuditService
  ) {
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });
    // tslint:disable-next-line:no-string-literal
    this.primaryLang = appConfigService.getConfig()['primaryLangCode'];
    // tslint:disable-next-line:no-string-literal
    this.secondaryLang = appConfigService.getConfig()['secondaryLangCode'];
    translateService.use(this.primaryLang);
    this.primaryKeyboard = appConstants.keyboardMapping[this.primaryLang];
    this.secondaryKeyboard = appConstants.keyboardMapping[this.secondaryLang];
    this.loadLocationData('MOR', 'region');
  }

  initializeComponent() {
    this.activatedRoute.params.subscribe(params => {
      const routeParts = this.router.url.split('/');
      if (routeParts[routeParts.length - 2] === 'single-view') {
        this.auditService.audit(8, centerSpecFile.auditEventIds[1], 'centers');
        this.disableForms = true;
        this.getData(params);
      } else {
        this.auditService.audit(16, 'ADM-096');
        this.initializeheader();
      }
    });
    this.translateService
      .getTranslation(this.secondaryLang)
      .subscribe(response => {
        this.secondaryLanguageLabels = response.center;
        console.log(this.secondaryLanguageLabels);
      });
    this.initializePrimaryForm();
    this.initializeSecondaryForm();
    this.getStubbedData();
    this.getProcessingTime();
    this.getTimeSlots();
    this.getZoneData();
    this.translateService
      .getTranslation(this.primaryLang)
      .subscribe(response => {
        this.popupMessages = response.center.popupMessages;
      });
  }

  getZoneData() {
    this.dataStorageService
      .getZoneData(this.primaryLang)
      .subscribe(response => {
        console.log(response);
        this.dropDownValues.zone.primary = response.response;
      });
    this.dataStorageService
      .getZoneData(this.secondaryLang)
      .subscribe(response => {
        console.log(response);
        this.dropDownValues.zone.secondary = response.response;
      });
  }

  onCreate() {
    let data = {};
    if (
      this.secondaryForm.controls.name.value === '' ||
      this.secondaryForm.controls.addressLine1.value === ''
    ) {
      data = {
        case: 'CONFIRMATION',
        title: this.popupMessages['create-edit'].title,
        message: this.popupMessages['create-edit'].mandatorySecondaryFields,
        yesBtnTxt: this.popupMessages['create-edit'].yesBtnText,
        noBtnTxt: this.popupMessages['create-edit'].noBtnText
      };
    } else {
      data = {
        case: 'CONFIRMATION',
        title: this.popupMessages['create-edit'].title,
        message: this.popupMessages['create-edit'].message,
        yesBtnTxt: this.popupMessages['create-edit'].yesBtnText,
        noBtnTxt: this.popupMessages['create-edit'].noBtnText
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

  updateData() {
    this.createUpdate = true;
    const primaryObject = new CenterModel(
      this.primaryForm.controls.addressLine1.value,
      this.primaryForm.controls.addressLine2.value,
      this.primaryForm.controls.addressLine3.value,
      Utils.convertTime(this.primaryForm.controls.endTime.value),
      Utils.convertTime(this.primaryForm.controls.startTime.value),
      this.primaryForm.controls.centerTypeCode.value,
      this.primaryForm.controls.contactPerson.value,
      this.primaryForm.controls.contactPhone.value,
      this.primaryForm.controls.holidayZone.value,
      this.primaryLang,
      this.primaryForm.controls.latitude.value,
      this.primaryForm.controls.postalCode.value,
      this.primaryForm.controls.longitude.value,
      Utils.convertTime(this.primaryForm.controls.lunchEndTime.value),
      Utils.convertTime(this.primaryForm.controls.lunchStartTime.value),
      this.primaryForm.controls.name.value,
      '00:' + this.primaryForm.controls.processingTime.value + ':00',
      this.data[0].timeZone,
      this.primaryForm.controls.workingHours.value,
      this.primaryForm.controls.zone.value,
      this.data[0].id,
      this.primaryForm.controls.isActive.value,
      this.primaryForm.controls.noKiosk.value
    );
    const secondaryObject = new CenterModel(
      this.secondaryForm.controls.addressLine1.value,
      this.secondaryForm.controls.addressLine2.value,
      this.secondaryForm.controls.addressLine3.value,
      Utils.convertTime(this.secondaryForm.controls.endTime.value),
      Utils.convertTime(this.secondaryForm.controls.startTime.value),
      this.secondaryForm.controls.centerTypeCode.value,
      this.secondaryForm.controls.contactPerson.value,
      this.secondaryForm.controls.contactPhone.value,
      this.secondaryForm.controls.holidayZone.value,
      this.secondaryLang,
      this.secondaryForm.controls.latitude.value,
      this.secondaryForm.controls.postalCode.value,
      this.secondaryForm.controls.longitude.value,
      Utils.convertTime(this.secondaryForm.controls.lunchEndTime.value),
      Utils.convertTime(this.secondaryForm.controls.lunchStartTime.value),
      this.secondaryForm.controls.name.value,
      '00:' + this.secondaryForm.controls.processingTime.value + ':00',
      this.data[0].timeZone,
      this.secondaryForm.controls.workingHours.value,
      this.secondaryForm.controls.zone.value,
      this.data[0].id,
      this.secondaryForm.controls.isActive.value,
      this.secondaryForm.controls.noKiosk.value
    );
    const request = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      primaryObject
    );
    console.log(request);
    this.dataStorageService.updateCenter(request).subscribe(updateResponse => {
      console.log(updateResponse);
      if (!updateResponse.errors || updateResponse.errors.length === 0) {
        if (this.secondaryForm.valid) {
          const secondaryRequest = new RequestModel(
            appConstants.registrationCenterCreateId,
            null,
            secondaryObject
          );
          this.dataStorageService
            .updateCenter(secondaryRequest)
            .subscribe(secondaryResponse => {
              if (
                !secondaryResponse.errors ||
                secondaryResponse.errors.length === 0
              ) {
                this.showMessage('update-success')
                  .afterClosed()
                  .subscribe(() => {
                    this.router.navigateByUrl('admin/resources/centers/view');
                  });
              } else {
                this.showMessage('update-error');
              }
            });
        } else {
          this.showMessage('update-success');
        }
      } else {
        this.showMessage('update-error');
      }
    });
  }

  showMessage(type: string, data?: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages[type].title,
        message:
          type === 'create-success'
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

  saveData() {
    this.createUpdate = true;
    const primaryObject = new CenterModel(
      this.primaryForm.controls.addressLine1.value,
      this.primaryForm.controls.addressLine2.value,
      this.primaryForm.controls.addressLine3.value,
      Utils.convertTime(this.primaryForm.controls.endTime.value),
      Utils.convertTime(this.primaryForm.controls.startTime.value),
      this.primaryForm.controls.centerTypeCode.value,
      this.primaryForm.controls.contactPerson.value,
      this.primaryForm.controls.contactPhone.value,
      this.primaryForm.controls.holidayZone.value,
      this.primaryLang,
      this.primaryForm.controls.latitude.value,
      this.primaryForm.controls.postalCode.value,
      this.primaryForm.controls.longitude.value,
      Utils.convertTime(this.primaryForm.controls.lunchEndTime.value),
      Utils.convertTime(this.primaryForm.controls.lunchStartTime.value),
      this.primaryForm.controls.name.value,
      '00:' + this.primaryForm.controls.processingTime.value + ':00',
      '(GTM+01:00) CENTRAL EUROPEAN TIME',
      this.primaryForm.controls.workingHours.value,
      this.primaryForm.controls.zone.value,
      '',
      false
    );
    const secondaryObject = new CenterModel(
      this.secondaryForm.controls.addressLine1.value,
      this.secondaryForm.controls.addressLine2.value,
      this.secondaryForm.controls.addressLine3.value,
      Utils.convertTime(this.secondaryForm.controls.endTime.value),
      Utils.convertTime(this.secondaryForm.controls.startTime.value),
      this.secondaryForm.controls.centerTypeCode.value,
      this.secondaryForm.controls.contactPerson.value,
      this.secondaryForm.controls.contactPhone.value,
      this.secondaryForm.controls.holidayZone.value,
      this.secondaryLang,
      this.secondaryForm.controls.latitude.value,
      this.secondaryForm.controls.postalCode.value,
      this.secondaryForm.controls.longitude.value,
      Utils.convertTime(this.secondaryForm.controls.lunchEndTime.value),
      Utils.convertTime(this.secondaryForm.controls.lunchStartTime.value),
      this.secondaryForm.controls.name.value,
      '00:' + this.secondaryForm.controls.processingTime.value + ':00',
      '(GTM+01:00) CENTRAL EUROPEAN TIME',
      this.secondaryForm.controls.workingHours.value,
      this.secondaryForm.controls.zone.value
    );
    delete primaryObject.numberOfKiosks;
    delete secondaryObject.numberOfKiosks;
    const primaryRequest = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      primaryObject
    );
    console.log(primaryRequest);
    this.dataStorageService
      .createCenter(primaryRequest)
      .subscribe(createResponse => {
        console.log(createResponse);
        if (!createResponse.errors) {
          if (this.secondaryForm.valid) {
            secondaryObject.id = createResponse.response.id;
            secondaryObject.isActive = false;
            const secondaryRequest = new RequestModel(
              appConstants.registrationCenterCreateId,
              null,
              secondaryObject
            );
            this.dataStorageService
              .createCenter(secondaryRequest)
              .subscribe(secondaryResponse => {
                if (!secondaryResponse.errors) {
                  this.showMessage('create-success', secondaryResponse.response)
                    .afterClosed()
                    .subscribe(() => {
                      this.primaryForm.reset();
                      this.secondaryForm.reset();
                      this.router.navigateByUrl('admin/resources/centers/view');
                    });
                } else {
                  this.showMessage('create-error');
                }
              });
          } else {
            this.showMessage('create-success', createResponse.response);
          }
        } else {
          this.showMessage('create-error');
        }
      });
  }

  async getData(params: any) {
    const filter = new FilterModel('id', 'equals', params.id);
    this.centerRequest.filters = [filter];
    this.centerRequest.languageCode = this.primaryLang;
    this.centerRequest.sort = [];
    this.centerRequest.pagination = { pageStart: 0, pageFetch: 10 };
    let request = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      this.centerRequest
    );
    this.centerService.getRegistrationCentersDetails(request).subscribe(
      response => {
        if (response.response.data) {
          this.data[0] = response.response.data[0];
          this.initializeheader();
          this.setPrimaryFormValues();
          this.centerRequest.languageCode = this.secondaryLang;
          request = new RequestModel(
            appConstants.registrationCenterCreateId,
            null,
            this.centerRequest
          );
          this.centerService
            .getRegistrationCentersDetails(request)
            .subscribe(secondaryResponse => {
              this.data[1] = secondaryResponse.response.data
                ? secondaryResponse.response.data[0]
                : {};
              this.setSecondaryFormValues();
              if (
                this.activatedRoute.snapshot.queryParams.editable === 'true'
              ) {
                this.disableForms = false;
                this.primaryForm.enable();
                this.primaryForm.controls.noKiosk.enable();
                this.primaryForm.controls.isActive.enable();
              }
            });
        } else {
          this.showErrorPopup();
        }
      },
      error => this.showErrorPopup()
    );
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
        this.router.navigateByUrl(`admin/resources/centers/view`)
      );
  }

  setPrimaryFormValues() {
    this.primaryForm.controls.name.setValue(this.data[0].name);
    this.primaryForm.controls.centerTypeCode.setValue(
      this.data[0].centerTypeCode
    );
    this.primaryForm.controls.contactPerson.setValue(
      this.data[0].contactPerson
    );
    this.primaryForm.controls.contactPhone.setValue(this.data[0].contactPhone);
    this.primaryForm.controls.longitude.setValue(this.data[0].longitude);
    this.primaryForm.controls.latitude.setValue(this.data[0].latitude);
    this.primaryForm.controls.addressLine1.setValue(this.data[0].addressLine1);
    this.primaryForm.controls.addressLine2.setValue(this.data[0].addressLine2);
    this.primaryForm.controls.addressLine3.setValue(this.data[0].addressLine3);
    this.primaryForm.controls.region.setValue(this.data[0].regionCode);
    this.primaryForm.controls.province.setValue(this.data[0].provinceCode);
    this.primaryForm.controls.city.setValue(this.data[0].cityCode);
    this.primaryForm.controls.laa.setValue(this.data[0].administrativeZoneCode);
    this.primaryForm.controls.postalCode.setValue(this.data[0].locationCode);
    this.primaryForm.controls.zone.setValue(this.data[0].zoneCode);
    this.primaryForm.controls.holidayZone.setValue(
      this.data[0].holidayLocationCode
    );
    this.primaryForm.controls.workingHours.setValue(
      this.data[0].workingHours.split(':')[0]
    );
    this.primaryForm.controls.noKiosk.setValue(this.data[0].numberOfKiosks);
    this.primaryForm.controls.processingTime.setValue(
      Number(this.data[0].perKioskProcessTime.split(':')[1])
    );
    this.primaryForm.controls.startTime.setValue(
      Utils.convertTimeTo12Hours(this.data[0].centerStartTime)
    );
    this.primaryForm.controls.endTime.setValue(
      Utils.convertTimeTo12Hours(this.data[0].centerEndTime)
    );
    this.primaryForm.controls.lunchStartTime.setValue(
      Utils.convertTimeTo12Hours(this.data[0].lunchStartTime)
    );
    this.primaryForm.controls.lunchEndTime.setValue(
      Utils.convertTimeTo12Hours(this.data[0].lunchEndTime)
    );
    this.primaryForm.controls.isActive.setValue(this.data[0].isActive);
    this.loadLocationDropDownsForUpdate(this.data[0]);
  }

  setSecondaryFormValues() {
    this.secondaryForm.controls.name.setValue(
      this.data[1].name ? this.data[1].name : ''
    );
    this.secondaryForm.controls.centerTypeCode.setValue(
      this.data[0].centerTypeCode
    );
    this.secondaryForm.controls.contactPerson.setValue(
      this.data[1].contactPerson ? this.data[1].contactPerson : ''
    );
    this.secondaryForm.controls.contactPhone.setValue(
      this.data[0].contactPhone
    );
    this.secondaryForm.controls.longitude.setValue(this.data[0].longitude);
    this.secondaryForm.controls.latitude.setValue(this.data[0].latitude);
    this.secondaryForm.controls.addressLine1.setValue(
      this.data[1].addressLine1 ? this.data[1].addressLine1 : ''
    );
    this.secondaryForm.controls.addressLine2.setValue(
      this.data[1].addressLine2 ? this.data[1].addressLine2 : ''
    );
    this.secondaryForm.controls.addressLine3.setValue(
      this.data[1].addressLine3 ? this.data[1].addressLine3 : ''
    );
    this.secondaryForm.controls.region.setValue(this.data[0].regionCode);
    this.secondaryForm.controls.province.setValue(this.data[0].provinceCode);
    this.secondaryForm.controls.city.setValue(this.data[0].cityCode);
    this.secondaryForm.controls.laa.setValue(
      this.data[0].administrativeZoneCode
    );
    this.secondaryForm.controls.postalCode.setValue(this.data[0].locationCode);
    this.secondaryForm.controls.zone.setValue(this.data[0].zoneCode);
    this.secondaryForm.controls.holidayZone.setValue(
      this.data[0].holidayLocationCode
    );
    this.secondaryForm.controls.workingHours.setValue(
      this.data[0].workingHours.split(':')[0]
    );
    this.secondaryForm.controls.noKiosk.setValue(this.data[0].numberOfKiosks);
    this.secondaryForm.controls.processingTime.setValue(
      Number(this.data[0].perKioskProcessTime.split(':')[1])
    );
    this.secondaryForm.controls.startTime.setValue(
      Utils.convertTimeTo12Hours(this.data[0].centerStartTime)
    );
    this.secondaryForm.controls.endTime.setValue(
      Utils.convertTimeTo12Hours(this.data[0].centerEndTime)
    );
    this.secondaryForm.controls.lunchStartTime.setValue(
      Utils.convertTimeTo12Hours(this.data[0].lunchStartTime)
    );
    this.secondaryForm.controls.lunchEndTime.setValue(
      Utils.convertTimeTo12Hours(this.data[0].lunchEndTime)
    );
    this.secondaryForm.controls.isActive.setValue(this.data[0].isActive);
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

  naviagteBack() {
    this.location.back();
  }

  loadLocationData(locationCode: string, fieldName: string) {
    this.dataStorageService
      .getImmediateChildren(locationCode, this.primaryLang)
      .subscribe(response => {
        // tslint:disable-next-line:no-string-literal
        this.dropDownValues[fieldName].primary =
          response['response']['locations'];
        console.log(this.dropDownValues);
      });
    this.dataStorageService
      .getImmediateChildren(locationCode, this.secondaryLang)
      .subscribe(response => {
        // tslint:disable-next-line:no-string-literal
        this.dropDownValues[fieldName].secondary =
          response['response']['locations'];
      });
  }

  initializePrimaryForm() {
    this.primaryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(128)]],
      centerTypeCode: ['', [Validators.required]],
      contactPerson: ['', [Validators.maxLength(128)]],
      contactPhone: ['', [Validators.maxLength(16)]],
      longitude: [
        '',
        [Validators.required, Validators.maxLength(32), ValidateLatLong]
      ],
      latitude: [
        '',
        [Validators.required, Validators.maxLength(32), ValidateLatLong]
      ],
      addressLine1: ['', [Validators.required, Validators.maxLength(256)]],
      addressLine2: ['', [Validators.maxLength(256)]],
      addressLine3: ['', [Validators.maxLength(256)]],
      region: ['', [Validators.required]],
      province: ['', [Validators.required]],
      city: ['', [Validators.required]],
      laa: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      zone: ['', [Validators.required]],
      holidayZone: ['', [Validators.required]],
      workingHours: [{ value: '', disabled: true }],
      noKiosk: [
        { value: 0, disabled: true },
        [Validators.required, Validators.min(0), ValidateKiosk]
      ],
      processingTime: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      lunchStartTime: [''],
      lunchEndTime: [''],
      isActive: [{ value: false, disabled: true }]
    });
    if (this.disableForms) {
      this.primaryForm.disable();
    }
  }

  initializeSecondaryForm() {
    this.secondaryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(128)]],
      centerTypeCode: [{ value: '', disabled: true }],
      contactPerson: ['', [Validators.maxLength(128)]],
      contactPhone: [{ value: '', disabled: true }],
      longitude: [{ value: '', disabled: true }],
      latitude: [{ value: '', disabled: true }],
      addressLine1: ['', [Validators.required, Validators.maxLength(256)]],
      addressLine2: ['', [Validators.maxLength(256)]],
      addressLine3: ['', [Validators.maxLength(256)]],
      region: [{ value: '', disabled: true }],
      province: [{ value: '', disabled: true }],
      city: [{ value: '', disabled: true }],
      laa: [{ value: '', disabled: true }],
      postalCode: [{ value: '', disabled: true }],
      zone: [{ value: '', disabled: true }],
      holidayZone: [{ value: '', disabled: true }],
      workingHours: [{ value: '', disabled: true }],
      noKiosk: [{ value: 0, disabled: true }],
      processingTime: [{ value: '', disabled: true }],
      startTime: [{ value: '', disabled: true }],
      endTime: [{ value: '', disabled: true }],
      lunchStartTime: [{ value: '', disabled: true }],
      lunchEndTime: [{ value: '', disabled: true }],
      isActive: [{ value: false, disabled: true }]
    });
    if (this.disableForms) {
      this.secondaryForm.disable();
    }
  }

  get primary() {
    return this.primaryForm.controls;
  }

  get secondary() {
    return this.secondaryForm.controls;
  }

  submit() {
    if (!this.disableForms) {
      this.auditService.audit(17, 'ADM-097');
      if (this.primaryForm.valid) {
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
      }
    } else {
      this.disableForms = false;
      this.primaryForm.enable();
      this.initializePrimaryForm();
      this.initializeSecondaryForm();
      this.setPrimaryFormValues();
      this.setSecondaryFormValues();
      this.primaryForm.controls.noKiosk.enable();
      this.primaryForm.controls.isActive.enable();
    }
  }

  copyDataToSecondaryForm(fieldName: string, value: string) {
    if (this.primaryForm.controls[fieldName].valid) {
      this.secondaryForm.controls[fieldName].setValue(value);
    } else {
      this.secondaryForm.controls[fieldName].setValue('');
    }
  }

  getStubbedData() {
    this.getRegistrationCenterTypes();
    this.dataStorageService.getStubbedDataForDropdowns().subscribe(response => {
      this.dropDownValues.holidayZone.primary =
        response[this.primaryLang].holidayZone;
      this.dropDownValues.holidayZone.secondary =
        response[this.secondaryLang].holidayZone;
    });
  }

  getRegistrationCenterTypes() {
    const filterObject = new FilterValuesModel('name', 'unique', '');
    let filterRequest = new FilterRequest([filterObject], this.primaryLang);
    let request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('registrationcentertypes', request)
      .subscribe(response => {
        this.dropDownValues.centerTypeCode.primary = response.response.filters;
      });
    filterRequest = new FilterRequest([filterObject], this.secondaryLang);
    request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('registrationcentertypes', request)
      .subscribe(response => {
        this.dropDownValues.centerTypeCode.secondary =
          response.response.filters;
      });
  }

  getProcessingTime() {
    this.dropDownValues.processingTime = Utils.minuteIntervals(
      appConstants.processingTimeStart,
      appConstants.processingTimeEnd,
      appConstants.processingTimeInterval
    );
  }

  getTimeSlots() {
    const slots = Utils.getTimeSlots(appConstants.timeSlotsInterval);
    this.dropDownValues.startTime = slots;
    this.dropDownValues.endTime = slots;
    this.dropDownValues.lunchEndTime = slots;
    this.dropDownValues.lunchStartTime = slots;
    this.allSlots = slots;
  }

  calculateWorkingHours() {
    if (
      this.primaryForm.controls.startTime.value &&
      this.primaryForm.controls.endTime.value
    ) {
      const x =
        Utils.getTimeInSeconds(this.primaryForm.controls.endTime.value) -
        Utils.getTimeInSeconds(this.primaryForm.controls.startTime.value);
      this.primaryForm.controls.workingHours.setValue(x / 3600);
      this.secondaryForm.controls.workingHours.setValue(x / 3600);
    }
  }

  updateTimeSlotDropdownOptions(
    changedField: string,
    targetField: string,
    action: string
  ) {
    const x = [...this.allSlots];
    const index = x.indexOf(this.primaryForm.controls[changedField].value);
    if (action === 'more') {
      this.dropDownValues[targetField] = x.splice(index + 1);
    } else if (action === 'less') {
      this.dropDownValues[targetField] = x.splice(0, index + 1);
    }
  }

  cancel() {
    this.location.back();
  }

  loadLocationDropDownsForUpdate(data: any) {
    this.loadLocationData('MOR', 'region');
    this.loadLocationData(data.regionCode, 'province');
    this.loadLocationData(data.provinceCode, 'city');
    this.loadLocationData(data.cityCode, 'laa');
    this.loadLocationData(data.administrativeZoneCode, 'postalCode');
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
}
