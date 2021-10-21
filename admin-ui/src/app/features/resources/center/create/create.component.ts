import {
  Component,
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
import { Router, NavigationEnd } from '@angular/router';
import { HeaderModel } from 'src/app/core/models/header.model';
import { CenterModel } from 'src/app/core/models/center.model';
import { RequestModel } from 'src/app/core/models/request.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
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
import { HolidayModel } from 'src/app/core/models/holiday-model';

import moment from 'moment';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import defaultJson from "../../../../../assets/i18n/default.json";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
})
export class CreateComponent {
  secondaryLanguageLabels: any;
  primaryLang: string;
  isPrimaryLangRTL: boolean;
  dropDownValues = new CenterDropdown();
  dynamicDropDown = {};
  allSlots: string[];
  disableForms: boolean;
  headerObject: HeaderModel;
  centerRequest = {} as CenterRequest;
  createUpdate = false;
  primaryForm: FormGroup;
  popupMessages: any;
  selectedField: HTMLElement;
  private keyboardRef: MatKeyboardRef<MatKeyboardComponent>;
  @ViewChildren('keyboardRef', { read: ElementRef })
  private attachToElementMesOne: any;
  primaryKeyboard: string;
  keyboardType: string;
  subscribed: any;
  days = [];
  holidayDate: any;
  minDate = new Date();
  locCode = 0;
  initialLocationCode: "";
  localeDtFormat = "";
  serverError:any;
  locationFieldNameList: string[] = [];
  dynamicFieldValue = {};
  constructor(
    private location: Location,
    private translateService: TranslateService,
    private headerService: HeaderService,
    private dataStorageService: DataStorageService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private appConfigService: AppConfigService,
    private router: Router,
    private keyboardService: MatKeyboardService,
    private auditService: AuditService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });
    // tslint:disable-next-line:no-string-literal
    this.primaryLang = this.headerService.getUserPreferredLanguage();
    // tslint:disable-next-line:no-string-literal
    translateService.use(this.primaryLang);
    this.primaryKeyboard = defaultJson.keyboardMapping[this.primaryLang];
    this.initialLocationCode = this.appConfigService.getConfig()['countryCode'];
    this.isPrimaryLangRTL = false;
    if(this.appConfigService.getConfig()['rightToLeftOrientation']){
      let allRTLLangs = this.appConfigService.getConfig()['rightToLeftOrientation'].split(',');
      let filteredList = allRTLLangs.filter(langCode => langCode == this.primaryLang);
      if (filteredList.length > 0) {
        this.isPrimaryLangRTL = true;
      }  
    }
    this.getLocationHierarchyLevels();  
  }

  lessThanEqual(locCode, index){
    return index <= locCode;
  }

  initializeComponent() {
    this.locCode = this.appConfigService.getConfig()['locationHierarchyLevel'];
    this.days = appConstants.days[this.primaryLang];    
    this.auditService.audit(16, 'ADM-096');
    this.initializeheader();
    this.initializePrimaryForm();
    this.getStubbedData();
    this.getProcessingTime();
    this.getTimeSlots();
    this.getLeafZoneData();
    this.getWorkingDays();
    let localeId = defaultJson.languages[this.primaryLang].locale;
    this.setLocaleForDatePicker(localeId);
    this.translateService
      .getTranslation(this.primaryLang)
      .subscribe(response => {
        this.serverError = response.serverError;
        this.popupMessages = response.center.popupMessages;
      });
  }

  setLocaleForDatePicker = (localeId) => {    
    this.dateAdapter.setLocale(localeId);
    let localeDtFormat = moment.localeData(localeId).longDateFormat('L');
    console.log(`locale for datePicker: ${localeId} : ${localeDtFormat}`);
    this.translateService.get('demographic.date_yyyy').subscribe((year: string) => {
      const yearLabel = year;
      this.translateService.get('demographic.date_mm').subscribe((month: string) => {
        const monthLabel = month;
        this.translateService.get('demographic.date_dd').subscribe((day: string) => {
          const dayLabel = day;
          if (localeDtFormat.indexOf("YYYY") != -1) {
            localeDtFormat = localeDtFormat.replace(/YYYY/g, yearLabel);
          }
          else if (localeDtFormat.indexOf("YY") != -1) {
            localeDtFormat = localeDtFormat.replace(/YY/g, yearLabel);
          }
          if (localeDtFormat.indexOf("MM") != -1) {
            localeDtFormat = localeDtFormat.replace(/MM/g, monthLabel);
          }
          else if (localeDtFormat.indexOf("M") != -1) {
            localeDtFormat = localeDtFormat.replace(/M/g, monthLabel);
          }
          if (localeDtFormat.indexOf("DD") != -1) {
            localeDtFormat = localeDtFormat.replace(/DD/g, dayLabel);
          }
          else if (localeDtFormat.indexOf("D") != -1) {
            localeDtFormat = localeDtFormat.replace(/D/g, dayLabel);
          }
          this.localeDtFormat = localeDtFormat;
          console.log(`locale for datePicker: ${localeId} : ${this.localeDtFormat}`);
        });  
      });  
    });
  }

  getLeafZoneData() {
    this.dataStorageService
      .getLeafZoneData(this.primaryLang)
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

  getWorkingDays(){
    this.dataStorageService
      .getWorkingDays(this.primaryLang)
      .subscribe(response => { 
        this.days = response["response"]["workingdays"]   
      });
  }

  onCreate() {
    let data = {};
    const zone = this.dropDownValues.zone.primary.filter(z => z.code === this.primaryForm.controls.zone.value);
    data = {
      case: 'CONFIRMATION',
      title: this.popupMessages['create'].title,
      message: this.popupMessages['create'].message[0] + zone[0].name + this.popupMessages['create'].message[1] + this.popupMessages['create'].message[2],
      yesBtnTxt: this.popupMessages['create'].yesBtnText,
      noBtnTxt: this.popupMessages['create'].noBtnText
    };
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.auditService.audit(18, 'ADM-104', 'create');
        this.saveData();
      } else if (!response) {
        this.auditService.audit(19, 'ADM-106', 'create');
      }
    });
  }

  showMessage(type: string, data?: any) {
    let message = "";
    if(type === 'create-success' || type === 'update-success'){
      message = this.popupMessages[type].message[0] + data.id + this.popupMessages[type].message[1] + data.name;
    }else{
      message = this.serverError[data.errors[0].errorCode];
    }
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages[type].title,
        message: message,
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
    /* let locationCode = "";

    if (1 == this.locCode) {
      locationCode = this.primaryForm.controls.region.value;
    } else if(2 == this.locCode) {
      locationCode = this.primaryForm.controls.province.value;
    } else if(3 == this.locCode) {
      locationCode = this.primaryForm.controls.city.value;
    } else if(4 == this.locCode) {
      locationCode = this.primaryForm.controls.laa.value;
    } else if(5 == this.locCode) {
      locationCode = this.primaryForm.controls.postalCode.value;
    }*/

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
      this.dynamicFieldValue[this.locationFieldNameList[this.locCode-1]],
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
      this.primaryForm.controls.noKiosk.value,
      this.formatWorkingDays(this.primaryForm.controls.workingDays.value),
      this.primaryForm.controls.exceptionalHolidays.value,
    );
    //delete primaryObject.numberOfKiosks;
    if (this.primaryForm.controls.exceptionalHolidays.value.length === 0) {
      delete primaryObject.exceptionalHolidayPutPostDto;
    }
    const primaryRequest = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      primaryObject
    );
    this.dataStorageService
      .createCenter(primaryRequest)
      .subscribe(createResponse => {
        console.log('Primary Response' + createResponse);
        if (!createResponse.errors) {
          this.showMessage('create-success', createResponse.response)
            .afterClosed()
            .subscribe(() => {
              //this.primaryForm.reset();
              this.router.navigateByUrl('admin/resources/centers/view');
            });
        } else {
          this.showMessage('create-error', createResponse);
        }
      });
  }

  initializeheader() {
    this.headerObject = new HeaderModel('-', '-', '-', '-', '-', '-', '-');
  }

  naviagteBack() {
    this.location.back();
  }

  resetLocationFields(fieldName: string) {
    const locationFields = ['region', 'province', 'city', 'laa', 'postalCode', 'zone'];
    const index = locationFields.indexOf(fieldName);
    for (let i = index; i < locationFields.length; i++) {
      this.primaryForm.controls[locationFields[i]].setValue('');
      this.primaryForm.controls[locationFields[i]].markAsUntouched();
    }
  }

  /*loadLocationData(locationCode: string, fieldName: string) {
    console.log("this.locationFieldNameList>>>"+this.locationFieldNameList);
    if (fieldName !== 'region' && !this.disableForms) {
      this.resetLocationFields(fieldName);
    }
    this.dataStorageService
    .getImmediateChildren(locationCode, this.primaryLang)
    .subscribe(response => {
      this.dropDownValues[fieldName].primary =
        response['response']['locations'];
    });
  }*/

  loadLocationDataDynamically(event:any, index: any) {
    let locationCode = ""; 
    let fieldName = "";   
    let self = this;    
    if(event === "") {
      fieldName = this.locationFieldNameList[parseInt(index)];
      locationCode = this.initialLocationCode;         
    }else{    
      fieldName = this.locationFieldNameList[parseInt(index)+1];
      locationCode = event.value; 
      this.dynamicFieldValue[this.locationFieldNameList[parseInt(index)]] = event.value;
      
      /*for (let i = parseInt(index)+1; i < this.locationFieldNameList.length; i++) {
       this.dynamicFieldValue[this.locationFieldNameList[parseInt(index)+1]] = [];
      }*/
    }
    this.dataStorageService
    .getImmediateChildren(locationCode, this.primaryLang)
    .subscribe(response => {
      if(response['response'])
        self.dynamicDropDown[fieldName] = response['response']['locations'];
    });
  }

  initializePrimaryForm() {
    let regionReq = [], provinceReq = [], cityReq = [], laaReq = [], postalCodeReq = [];
   /* if (1 <= this.locCode) {
      regionReq = [Validators.required];
    } if(2 <= this.locCode) {
      provinceReq = [Validators.required];
    } if(3 <= this.locCode) {
      cityReq = [Validators.required];
    } if(4 <= this.locCode) {
      laaReq = [Validators.required];
    } if(5 <= this.locCode) {
      postalCodeReq = [Validators.required];
    }*/
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
        0,
        [Validators.required, Validators.min(0), ValidateKiosk]
      ],
      processingTime: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      lunchStartTime: [''],
      lunchEndTime: [''],
      workingDays: [[], [Validators.required]],
      exceptionalHolidays: [[]],
      //isActive: [{ value: true, disabled: true}]
    });
  }

  get primary() {
    return this.primaryForm.controls;
  }

  submit() {
    if (!this.disableForms) {
      this.auditService.audit(17, 'ADM-097');
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
      this.primaryForm.controls.noKiosk.enable();
      //this.primaryForm.controls.isActive.enable();
    }
  }

  getStubbedData() {
    this.getRegistrationCenterTypes();    
    this.dataStorageService.getStubbedDataForDropdowns(this.primaryLang).subscribe(response => {
      if (response.response.locations) {
        this.dropDownValues.holidayZone.primary =
        response.response.locations;
      }
    });
  }

  getLocationHierarchyLevels() {
    let self = this;
    let fieldNameData = {};
    this.dataStorageService.getLocationHierarchyLevels(this.primaryLang).subscribe(response => {
      response.response.locationHierarchyLevels.forEach(function (value) {
        if(value.hierarchyLevel != 0)
          if(value.hierarchyLevel <= self.locCode)          
            self.locationFieldNameList.push(value.hierarchyLevelName);          
      });  
      for(let value of this.locationFieldNameList) {
        self.dynamicDropDown[value] = []; 
        self.dynamicFieldValue[value] = "";
      }
      self.loadLocationDataDynamically("", 0);
      //self.loadLocationData(this.initialLocationCode, 'region');     
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
    if (
      this.primaryForm.controls.startTime.value &&
      this.primaryForm.controls.endTime.value
    ) {
      const x =
        Utils.getTimeInSeconds(this.primaryForm.controls.endTime.value) -
        Utils.getTimeInSeconds(this.primaryForm.controls.startTime.value);
      this.primaryForm.controls.workingHours.setValue(x / 3600);
      this.primaryForm.controls.lunchStartTime.setValue('');
      this.primaryForm.controls.lunchEndTime.setValue('');
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
 
  validateAndLoadLunchStartTime() {
    if (this.primaryForm.controls.startTime.value !== "" && this.primaryForm.controls.startTime.valid) {
      const x = [...this.allSlots];
      let startIndex = x.indexOf(this.primaryForm.controls.startTime.value) + 1;
      if (this.primaryForm.controls.lunchEndTime.value !== '' && this.primaryForm.controls.lunchEndTime.valid) {
        const endIndex = x.indexOf(this.primaryForm.controls.lunchEndTime.value);
        this.dropDownValues.lunchStartTime = x.slice(startIndex, endIndex);
      } else {
        const endIndex = x.indexOf(this.primaryForm.controls.endTime.value);
        this.dropDownValues.lunchStartTime = x.slice(startIndex, endIndex);
      }
    }
    // else {
    //   this.dialog.open(DialogComponent, {
    //     data: {
    //       case: 'MESSAGE',
    //       title: this.popupMessages.lunchTimeValidation.title,
    //       message: this.popupMessages.lunchTimeValidation.message,
    //       btnTxt: this.popupMessages.lunchTimeValidation.btnTxt
    //     }
    //   });
    // } 
  }

  validateAndLoadLunchEndTime() {
    if (this.primaryForm.controls.endTime.value !== "" && this.primaryForm.controls.endTime.valid) {
      const x = [...this.allSlots];
      const endIndex = x.indexOf(this.primaryForm.controls.endTime.value);
      if (this.primaryForm.controls.lunchStartTime.value !== '' && this.primaryForm.controls.lunchStartTime.valid) {
        const startIndex = x.indexOf(this.primaryForm.controls.lunchStartTime.value) + 1;
        this.dropDownValues.lunchEndTime = x.slice(startIndex, endIndex);  
      } else {
        const startIndex = x.indexOf(this.primaryForm.controls.startTime.value) + 1;
        this.dropDownValues.lunchEndTime = x.slice(startIndex, endIndex);
      } 
    }
    // else {
    //   this.dialog.open(DialogComponent, {
    //     data: {
    //       case: 'MESSAGE',
    //       title: this.popupMessages.lunchTimeValidation.title,
    //       message: this.popupMessages.lunchTimeValidation.message,
    //       btnTxt: this.popupMessages.lunchTimeValidation.btnTxt
    //     }
    //   });
    // }
  }

  cancel() {
    this.location.back();
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

  createExceptionalHoliday() {
    if (this.holidayDate) {
      const existingHolidays = this.primaryForm.controls.exceptionalHolidays.value;
      const holidayObj = new HolidayModel(Utils.formatDate(this.holidayDate));
      const x = existingHolidays.filter(holiday => holiday.exceptionHolidayDate === holidayObj.exceptionHolidayDate);
      if (x.length === 0) {
        existingHolidays.push(holidayObj);
        this.primaryForm.controls.exceptionalHolidays.setValue(existingHolidays);
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
      (this.primaryForm.touched) &&
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