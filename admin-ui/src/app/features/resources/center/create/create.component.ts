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
import { OptionalFilterValuesModel } from 'src/app/core/models/optional-filter-values.model';
import {
  MatKeyboardRef,
  MatKeyboardComponent,
  MatKeyboardService
} from 'ngx7-material-keyboard';
import { AuditService } from 'src/app/core/services/audit.service';
import { HeaderService } from 'src/app/core/services/header.service';
import * as centerSpecFile from '../../../../../assets/entity-spec/center.json';
import { HolidayModel } from 'src/app/core/models/holiday-model';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent {
  secondaryLanguageLabels: any;
  allSupportedLanguages: Array<string>;
  primaryLang: string;
  secondaryLang: string;
  secondaryLanguagesArr: Array<string>;
  dropDownValues = new CenterDropdown();
  allSlots: string[];
  disableForms: boolean;
  headerObject: HeaderModel;
  centerRequest = {} as CenterRequest;
  createUpdate = false;
  showSecondaryForm: boolean;
  secondaryObject: any;

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

  days = [];
  secondaryDays = [];

  holidayDate: any;
  minDate = new Date();
  locCode = 0;
  constructor(
    private location: Location,
    private translateService: TranslateService,
    private headerService: HeaderService,
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
    this.primaryLang = this.headerService.getUserPreferredLanguage();
    this.allSupportedLanguages = this.appConfigService.getConfig()['allSupportedLanguages'];
    this.secondaryLanguagesArr = this.allSupportedLanguages.filter(lang => lang !== this.primaryLang);
    
    // tslint:disable-next-line:no-string-literal
    this.secondaryLang = this.secondaryLanguagesArr[0];
    this.primaryLang === this.secondaryLang ? this.showSecondaryForm = false : this.showSecondaryForm = true;
    translateService.use(this.primaryLang);
    this.primaryKeyboard = appConstants.keyboardMapping[this.primaryLang];
    this.secondaryKeyboard = appConstants.keyboardMapping[this.secondaryLang];
    this.loadLocationData('MOR', 'region');
  }

  lessThanEqual(locCode, index){
    return index <= locCode;
  }

  initializeComponent() {
    this.locCode = this.appConfigService.getConfig()['locationHierarchyLevel'];
    this.days = appConstants.days[this.primaryLang];
    this.secondaryDays = appConstants.days[this.secondaryLang];
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

  onCreate() {
    let data = {};
    if (
      (this.secondaryForm.controls.name.value === '' ||
      this.secondaryForm.controls.addressLine1.value === '') && this.showSecondaryForm
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
        const zone = this.dropDownValues.zone.primary.filter(z => z.code === this.primaryForm.controls.zone.value);
        data = {
          case: 'CONFIRMATION',
          title: this.popupMessages['create'].title,
          message: this.popupMessages['create'].message[0] + zone[0].name + this.popupMessages['create'].message[1],
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
    let locationCode, secondaryLocationCode = "";
    if(1 == this.locCode){
      locationCode = this.primaryForm.controls.region.value;
      secondaryLocationCode = this.secondaryForm.controls.region.value;
    }else if(2 == this.locCode){
      locationCode = this.primaryForm.controls.province.value;
      secondaryLocationCode = this.secondaryForm.controls.province.value;
    }else if(3 == this.locCode){
      locationCode = this.primaryForm.controls.city.value;
      secondaryLocationCode = this.secondaryForm.controls.city.value;
    }else if(4 == this.locCode){
      locationCode = this.primaryForm.controls.laa.value;
      secondaryLocationCode = this.secondaryForm.controls.laa.value;
    }else if(5 == this.locCode){
      locationCode = this.primaryForm.controls.postalCode.value;
      secondaryLocationCode = this.secondaryForm.controls.postalCode.value;
    }

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
      locationCode,
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
      this.primaryForm.controls.noKiosk.value,
      this.formatWorkingDays(this.primaryForm.controls.workingDays.value),
      this.primaryForm.controls.exceptionalHolidays.value,
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
      secondaryLocationCode,
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
    this.dataStorageService.updateData(request).subscribe(updateResponse => {
      console.log('Primary Response' + updateResponse);
      console.log(this.showSecondaryForm);
      if (!updateResponse.errors || updateResponse.errors.length === 0) {
        if (this.secondaryForm.valid) {
          if (this.showSecondaryForm) {
          const secondaryRequest = new RequestModel(
            appConstants.registrationCenterCreateId,
            null,
            secondaryObject
          );
          this.dataStorageService
            .updateData(secondaryRequest)
            .subscribe(secondaryResponse => {
              console.log('Secondary Response' + secondaryResponse);
              if (
                !secondaryResponse.errors ||
                secondaryResponse.errors.length === 0
              ) {
                this.showMessage('update-success', primaryObject)
                  .afterClosed()
                  .subscribe(() => {
                    this.router.navigateByUrl('admin/resources/centers/view');
                  });
              } else {
                this.showMessage('update-error');
              }
            });
          }
        } else {
          this.showMessage('update-success', primaryObject).afterClosed()
          .subscribe(() => {
            this.router.navigateByUrl('admin/resources/centers/view');
          });
        }
      } else {
        this.showMessage('update-error');
      }
    });
  }

  showMessage(type: string, data?: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
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

  formatWorkingDays(selectedDays: string[]) {
    const obj = {};
    this.days.forEach(day => {
      if (selectedDays.indexOf(day.code) >= 0) {
        obj[day.code] = true;
      } else {
        obj[day.code] = false;
      }
    });
    console.log(obj);
    return obj;
  }

  reverseFormatWorkingDays(days: any) {
    const keys = Object.keys(days);
    const selectedDays = [];
    keys.forEach(key => {
      if (days[key]) {
        selectedDays.push(key);
      }
    });
    return selectedDays;
  }

  saveData() {
    this.createUpdate = true;
    let locationCode, secondaryLocationCode = "";
    if(1 == this.locCode){
      locationCode = this.primaryForm.controls.region.value;
      secondaryLocationCode = this.secondaryForm.controls.region.value;
    }else if(2 == this.locCode){
      locationCode = this.primaryForm.controls.province.value;
      secondaryLocationCode = this.secondaryForm.controls.province.value;
    }else if(3 == this.locCode){
      locationCode = this.primaryForm.controls.city.value;
      secondaryLocationCode = this.secondaryForm.controls.city.value;
    }else if(4 == this.locCode){
      locationCode = this.primaryForm.controls.laa.value;
      secondaryLocationCode = this.secondaryForm.controls.laa.value;
    }else if(5 == this.locCode){
      locationCode = this.primaryForm.controls.postalCode.value;
      secondaryLocationCode = this.secondaryForm.controls.postalCode.value;
    }

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
      locationCode,
      this.primaryForm.controls.longitude.value,
      Utils.convertTime(this.primaryForm.controls.lunchEndTime.value),
      Utils.convertTime(this.primaryForm.controls.lunchStartTime.value),
      this.primaryForm.controls.name.value,
      '00:' + this.primaryForm.controls.processingTime.value + ':00',
      '(GTM+01:00) CENTRAL EUROPEAN TIME',
      this.primaryForm.controls.workingHours.value,
      this.primaryForm.controls.zone.value,
      '',
      false,
      0,
      this.formatWorkingDays(this.primaryForm.controls.workingDays.value),
      this.primaryForm.controls.exceptionalHolidays.value,
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
      secondaryLocationCode,
      this.secondaryForm.controls.longitude.value,
      Utils.convertTime(this.secondaryForm.controls.lunchEndTime.value),
      Utils.convertTime(this.secondaryForm.controls.lunchStartTime.value),
      this.secondaryForm.controls.name.value,
      '00:' + this.secondaryForm.controls.processingTime.value + ':00',
      '(GTM+01:00) CENTRAL EUROPEAN TIME',
      this.secondaryForm.controls.workingHours.value,
      this.secondaryForm.controls.zone.value,
      '',
      false
    );
    delete primaryObject.numberOfKiosks;
    delete secondaryObject.numberOfKiosks;
    if (this.primaryForm.controls.exceptionalHolidays.value.length === 0) {
      delete primaryObject.exceptionalHolidayPutPostDto;
    }
    const primaryRequest = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      primaryObject
    );
    console.log(primaryRequest);
    this.dataStorageService
      .createCenter(primaryRequest)
      .subscribe(createResponse => {
        console.log('Primary Response' + createResponse);
        if (!createResponse.errors) {
          if (this.secondaryForm.valid) {
            if (this.showSecondaryForm) {
              console.log('inside secondary block');
              secondaryObject.id = createResponse.response.id;
              secondaryObject.isActive = false;
              const secondaryRequest = new RequestModel(
              appConstants.registrationCenterCreateId,
              null,
              secondaryObject
            );
              console.log(JSON.stringify(secondaryRequest));
              this.dataStorageService
              .createCenter(secondaryRequest)
              .subscribe(secondaryResponse => {
                console.log('Secondary Response' + secondaryResponse);
                if (!secondaryResponse.errors) {
                  this.showMessage('create-success', createResponse.response)
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
            }else {
              this.showMessage('create-success', createResponse.response)
              .afterClosed()
                      .subscribe(() => {
                        this.primaryForm.reset();
                        this.secondaryForm.reset();
                        this.router.navigateByUrl('admin/resources/centers/view');
                      });
            }
          } else {
            this.showMessage('create-success', createResponse.response)
            .afterClosed()
                    .subscribe(() => {
                      this.primaryForm.reset();
                      this.secondaryForm.reset();
                      this.router.navigateByUrl('admin/resources/centers/view');
                    });
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
          if (this.showSecondaryForm) {
          this.centerService
            .getRegistrationCentersDetails(request)
            .subscribe(secondaryResponse => {
              this.data[1] = secondaryResponse.response.data
                ? secondaryResponse.response.data[0]
                : {};
              this.setSecondaryFormValues();
            });
          }
          // if (
          //     this.activatedRoute.snapshot.queryParams.editable === 'true'
          //   ) {
              this.disableForms = false;
              this.primaryForm.enable();
              if (this.showSecondaryForm) {
              this.initializeSecondaryForm();
              this.setSecondaryFormValues();
              }
              this.primaryForm.controls.noKiosk.enable();
              this.primaryForm.controls.isActive.enable();
            //}
        } else {
          //this.showErrorPopup();
        }
      },
      error => this.showErrorPopup()
    );
  }

  showErrorPopup() {
    this.dialog
      .open(DialogComponent, {
        width: '400px',
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
    this.primaryForm.controls.workingDays.setValue(this.data[0].workingNonWorkingDays ?
      this.reverseFormatWorkingDays(this.data[0].workingNonWorkingDays) : []);
    this.primaryForm.controls.exceptionalHolidays.setValue(
      this.data[0].exceptionalHolidayPutPostDto ? [...this.data[0].exceptionalHolidayPutPostDto] : []);
    this.primaryForm.controls.isActive.setValue(this.data[0].isActive);
    this.loadLocationDropDownsForUpdate(this.data[0]);
  }

  setSecondaryFormValues() {
    if (this.data && this.data.length > 1) {
      this.secondaryForm.controls.name.setValue(
        this.data[1].name ? this.data[1].name : ''
      );
    }
    this.secondaryForm.controls.centerTypeCode.setValue(
      this.data[0].centerTypeCode
    );
    if (this.data && this.data.length > 1) {
      this.secondaryForm.controls.contactPerson.setValue(
        this.data[1].contactPerson ? this.data[1].contactPerson : ''
      );
    }
    this.secondaryForm.controls.contactPhone.setValue(
      this.data[0].contactPhone
    );
    this.secondaryForm.controls.longitude.setValue(this.data[0].longitude);
    this.secondaryForm.controls.latitude.setValue(this.data[0].latitude);
    if (this.data && this.data.length > 1) {
      this.secondaryForm.controls.addressLine1.setValue(
        this.data[1].addressLine1 ? this.data[1].addressLine1 : ''
      );
      this.secondaryForm.controls.addressLine2.setValue(
        this.data[1].addressLine2 ? this.data[1].addressLine2 : ''
      );
      this.secondaryForm.controls.addressLine3.setValue(
        this.data[1].addressLine3 ? this.data[1].addressLine3 : ''
      );
    }
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
    this.secondaryForm.controls.workingDays.setValue(this.data[0].workingNonWorkingDays ?
      this.reverseFormatWorkingDays(this.data[0].workingNonWorkingDays) : []);
    this.secondaryForm.controls.exceptionalHolidays.setValue(this.data[0].exceptionalHolidayPutPostDto ?
       [...this.data[0].exceptionalHolidayPutPostDto] : []);
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

  resetLocationFields(fieldName: string) {
    const locationFields = ['region', 'province', 'city', 'laa', 'postalCode', 'zone'];
    const index = locationFields.indexOf(fieldName);
    for (let i = index; i < locationFields.length; i++) {
      this.primaryForm.controls[locationFields[i]].setValue('');
      this.secondaryForm.controls[locationFields[i]].setValue('');
      this.primaryForm.controls[locationFields[i]].markAsUntouched();
      this.secondaryForm.controls[locationFields[i]].markAsUntouched();
    }
  }

  loadLocationData(locationCode: string, fieldName: string) {
    if (fieldName !== 'region' && !this.disableForms) {
      this.resetLocationFields(fieldName);
    }
    this.dataStorageService
      .getImmediateChildren(locationCode, this.primaryLang)
      .subscribe(response => {
        this.dropDownValues[fieldName].primary =
          response['response']['locations'];
        console.log(this.dropDownValues);
      });
    this.dataStorageService
      .getImmediateChildren(locationCode, this.secondaryLang)
      .subscribe(response => {
        this.dropDownValues[fieldName].secondary =
          response['response']['locations'];
      });
  }

  initializePrimaryForm() {

    let regionReq = [], provinceReq = [], cityReq = [], laaReq = [], postalCodeReq = [];
    if(1 <= this.locCode){
      regionReq = [Validators.required];
    }if(2 <= this.locCode){
      provinceReq = [Validators.required];
    }if(3 <= this.locCode){
      cityReq = [Validators.required];
    }if(4 <= this.locCode){
      laaReq = [Validators.required];
    }if(5 <= this.locCode){
      postalCodeReq = [Validators.required];
    }

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
      region: ['', regionReq],
      province: ['', provinceReq],
      city: ['', cityReq],
      laa: ['', laaReq],
      postalCode: ['', postalCodeReq],
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
      workingDays: [[], [Validators.required]],
      exceptionalHolidays: [[]],
      isActive: [{ value: false}]
    });
    
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
      workingDays: [{ value: [], disabled: true}],
      exceptionalHolidays: [[]],
      isActive: [{ value: false, disabled: true }]
    });
   
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
      console.log("this.primaryForm.valid>>>"+this.primaryForm.valid);
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
      if (this.showSecondaryForm) {
        this.initializeSecondaryForm();
        this.setSecondaryFormValues();
      }
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
    this.getLocationHierarchyLevels();
    this.dataStorageService.getStubbedDataForDropdowns(this.primaryLang).subscribe(response => {
      if (response.response.locations) {
        this.dropDownValues.holidayZone.primary =
        response.response.locations;
      }
    });
    this.dataStorageService.getStubbedDataForDropdowns(this.secondaryLang).subscribe(response => {
      if (response.response.locations) {
        this.dropDownValues.holidayZone.secondary =
        response.response.locations;
      }
    });
  }

  getLocationHierarchyLevels() {
    this.dataStorageService.getLocationHierarchyLevels(this.primaryLang).subscribe(response => {
      console.log("response.response.locationHierarchyLevels.primary>>>"+response.response.locationHierarchyLevels);
    });
    this.dataStorageService.getLocationHierarchyLevels(this.secondaryLang).subscribe(response => {
      console.log("response.response.locationHierarchyLevels.secondary>>>"+response.response.locationHierarchyLevels);
    });
  }

  getRegistrationCenterTypes() {
    let filterObject = new FilterValuesModel('name', 'unique', '');
    let optinalFilterObject = new OptionalFilterValuesModel('isActive', 'equals', 'true');
    let filterRequest = new FilterRequest([filterObject], this.primaryLang, [optinalFilterObject]);
    let request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('registrationcentertypes', request)
      .subscribe(response => {
        this.dropDownValues.centerTypeCode.primary = response.response.filters;
      });
    filterRequest = new FilterRequest([filterObject], this.secondaryLang, [optinalFilterObject]);
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
    this.allSlots = slots;
  }

  calculateWorkingHours() {
    console.log("calculateWorkingHours>>>>");
    if (
      this.primaryForm.controls.startTime.value &&
      this.primaryForm.controls.endTime.value
    ) {
      const x =
        Utils.getTimeInSeconds(this.primaryForm.controls.endTime.value) -
        Utils.getTimeInSeconds(this.primaryForm.controls.startTime.value);
      this.primaryForm.controls.workingHours.setValue(x / 3600);
      this.secondaryForm.controls.workingHours.setValue(x / 3600);
      this.primaryForm.controls.lunchStartTime.setValue('');
      this.primaryForm.controls.lunchEndTime.setValue('');
      this.secondaryForm.controls.lunchStartTime.setValue('');
      this.secondaryForm.controls.lunchEndTime.setValue('');
      this.dropDownValues.lunchStartTime = [];
      this.dropDownValues.lunchEndTime = [];
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

  validateAndLoadLunchTime(fieldName: string) {
    console.log("validateAndLoadLunchTime");
    if (this.primaryForm.controls.startTime.valid && this.primaryForm.controls.endTime.valid) {
      if (fieldName === 'lunchStartTime') {
        const x = [...this.allSlots];
        console.log(x);
        const startIndex = x.indexOf(this.primaryForm.controls.startTime.value) + 1;
        if (this.primaryForm.controls.lunchEndTime.value !== '') {
          const endIndex = x.indexOf(this.primaryForm.controls.lunchEndTime.value);
          this.dropDownValues.lunchStartTime = x.slice(startIndex, endIndex);
        } else {
          const endIndex = x.indexOf(this.primaryForm.controls.endTime.value);
          this.dropDownValues.lunchStartTime = x.slice(startIndex, endIndex);
        }
        console.log("this.dropDownValues.lunchStartTime>>>"+this.dropDownValues.lunchStartTime);
      } else if (fieldName === 'lunchEndTime') {
        const x = [...this.allSlots];
        const endIndex = x.indexOf(this.primaryForm.controls.endTime.value);
        if (this.primaryForm.controls.lunchStartTime.value !== '') {
          const startIndex = x.indexOf(this.primaryForm.controls.lunchStartTime.value) + 1;
          this.dropDownValues.lunchEndTime = x.slice(startIndex, endIndex);
        } else {
          const startIndex = x.indexOf(this.primaryForm.controls.startTime.value) + 1;
          this.dropDownValues.lunchEndTime = x.slice(startIndex, endIndex);
        }
      }
    } else {
      this.dialog.open(DialogComponent, {
        data: {
          case: 'MESSAGE',
          title: this.popupMessages.lunchTimeValidation.title,
          message: this.popupMessages.lunchTimeValidation.message,
          btnTxt: this.popupMessages.lunchTimeValidation.btnTxt
        }
      });
    }
  }

  cancel() {
    this.location.back();
  }

  loadLocationDropDownsForUpdate(data: any) {
    if(1 <= this.locCode){
      this.loadLocationData('MOR', 'region');
    }if(2 <= this.locCode){
      this.loadLocationData(data.regionCode, 'province');
    }if(3 <= this.locCode){
      this.loadLocationData(data.provinceCode, 'city');
    }if(4 <= this.locCode){
      this.loadLocationData(data.cityCode, 'laa');
    }if(5 <= this.locCode){
      this.loadLocationData(data.administrativeZoneCode, 'postalCode');
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

  createExceptionalHoliday() {
    if (this.holidayDate) {
      const existingHolidays = this.primaryForm.controls.exceptionalHolidays.value;
      const holidayObj = new HolidayModel(Utils.formatDate(this.holidayDate));
      const x = existingHolidays.filter(holiday => holiday.exceptionHolidayDate === holidayObj.exceptionHolidayDate);
      if (x.length === 0) {
        existingHolidays.push(holidayObj);
        this.primaryForm.controls.exceptionalHolidays.setValue(existingHolidays);
        this.secondaryForm.controls.exceptionalHolidays.setValue(existingHolidays);
      }
      this.holidayDate = undefined;
    }
  }

  deleteHoliday(i: number) {
    if (!this.disableForms) {
      let existingHolidays = this.primaryForm.controls.exceptionalHolidays.value;
      existingHolidays.splice(i, 1);
      this.primaryForm.controls.exceptionalHolidays.setValue(existingHolidays);
      /*existingHolidays = this.secondaryForm.controls.exceptionalHolidays.value;
      existingHolidays.splice(i, 1);
      this.secondaryForm.controls.exceptionalHolidays.setValue(existingHolidays);*/
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
          width: '650px',
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
