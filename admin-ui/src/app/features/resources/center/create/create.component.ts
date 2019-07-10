import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { CenterDropdown } from 'src/app/core/models/center-dropdown';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Utils from '../../../../app.utils';
import * as appConstants from '../../../../app.constants';
import { ValidateLatLong, ValidateKiosk } from 'src/app/core/validators/center.validator';
import { AppConfigService } from 'src/app/app-config.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CenterHeaderModel } from 'src/app/core/models/center-header.model';
import { CenterModel } from 'src/app/core/models/center.model';
import { RequestModel } from 'src/app/core/models/request.model';
import { CenterService } from 'src/app/core/services/center.service';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { FilterModel } from 'src/app/core/models/filter.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent implements OnInit {

  secondaryLanguageLabels: any;
  primaryLang: string;
  secondaryLang: string;
  dropDownValues = new CenterDropdown();
  allSlots: string[];
  disableForms: boolean;
  headerObject: CenterHeaderModel;
  centerRequest = {} as CenterRequest;

  primaryForm: FormGroup;
  secondaryForm: FormGroup;

  data = [];
  popupMessages: any;

  constructor(private location: Location,
              private translateService: TranslateService,
              private dataStorageService: DataStorageService,
              private dialog: MatDialog,
              private formBuilder: FormBuilder,
              private appConfigService: AppConfigService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private centerService: CenterService) {
                   // tslint:disable-next-line:no-string-literal
                   this.primaryLang = appConfigService.getConfig()['primaryLangCode'];
                   // tslint:disable-next-line:no-string-literal
                   this.secondaryLang = appConfigService.getConfig()['secondaryLangCode'];
                   translateService.use(this.primaryLang);
                   this.loadLocationData('MOR', 'region');
  }

 async ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const routeParts = this.router.url.split('/');
      if (routeParts[routeParts.length - 2] === 'single-view') {
        this.disableForms = true;
        this.getData(params);
      } else {
        this.initializeheader();
      }
    });
    this.dataStorageService.getLanguageSpecificLabels(this.secondaryLang).subscribe(response => {
      this.secondaryLanguageLabels = response.center;
      console.log(this.secondaryLanguageLabels);
    });
    this.initializePrimaryForm();
    this.initializeSecondaryForm();
    this.getStubbedData();
    this.getProcessingTime();
    this.getTimeSlots();
    this.translateService.getTranslation(this.primaryLang).subscribe(response => {
      this.popupMessages = response.center.popupMessages;
    });
  }

  onCreate() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        case: 'CONFIRMATION',
        title: this.popupMessages['create-edit'].title,
        message: this.popupMessages['create-edit'].message,
        yesBtnTxt: this.popupMessages['create-edit'].yesBtnText,
        noBtnTxt: this.popupMessages['create-edit'].noBtnText
      }
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response && this.data.length === 0) {
        this.saveData();
      } else if (response && this.data.length !== 0) {
        this.updateData();
      }
    });
  }

  updateData() {
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
      this.data[1].timeZone,
      this.secondaryForm.controls.workingHours.value,
      this.data[1].id,
      this.secondaryForm.controls.isActive.value,
      this.secondaryForm.controls.noKiosk.value
    );
    const request = new RequestModel(
      appConstants.registrationCenterCreateId, null, [primaryObject, secondaryObject]
    );
    console.log(request);
    this.dataStorageService.updateCenter(request).subscribe(updateResponse => {
      console.log(updateResponse);
      if (!updateResponse.error) {
        this.dialog.open(DialogComponent, {
          width: '350px',
          data: {
            case: 'MESSAGE',
            title: this.popupMessages['update-success'].title,
            message: this.popupMessages['update-success'].message,
            btnTxt: this.popupMessages['update-success'].btnTxt
          }
        }).afterClosed().subscribe(() => {
          this.router.navigateByUrl('admin/resources/centers/view');
        });
      } else {
        this.dialog.open(DialogComponent, {
          width: '350px',
          data: {
            case: 'MESSAGE',
            title: this.popupMessages['update-error'].title,
            message: this.popupMessages['update-error'].message,
            btnTxt: this.popupMessages['update-error'].btnTxt
          }
        });
      }
    });
  }

  saveData() {
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
      this.primaryForm.controls.workingHours.value
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
      this.secondaryForm.controls.workingHours.value
    );
    delete primaryObject.id;
    delete secondaryObject.id;
    delete primaryObject.isActive;
    delete secondaryObject.isActive;
    delete primaryObject.numberOfKiosks;
    delete secondaryObject.numberOfKiosks;
    const request = new RequestModel(
      appConstants.registrationCenterCreateId, null, [primaryObject, secondaryObject]
    );
    console.log(request);
    this.dataStorageService.createCenter(request).subscribe(createResponse => {
      console.log(createResponse);
      if (!createResponse.error) {
        this.dialog.open(DialogComponent, {
          width: '350px',
          data: {
            case: 'MESSAGE',
            title: this.popupMessages['create-success'].title,
            message:  this.popupMessages['create-success'].message[0] +
                      createResponse.response.registrationCenters[0].id +
                      this.popupMessages['create-success'].message[1] + createResponse.response.registrationCenters[0].name,
            btnTxt:  this.popupMessages['create-success'].btnTxt
          }
        }).afterClosed().subscribe(() => {
          this.primaryForm.reset();
          this.secondaryForm.reset();
          this.router.navigateByUrl('admin/resources/centers/view');
        });
      } else {
        this.dialog.open(DialogComponent, {
          width: '350px',
          data: {
            case: 'MESSAGE',
            title:  this.popupMessages['create-error'].title,
            message:  this.popupMessages['create-error'].title,
            btnTxt:  this.popupMessages['create-error'].title
          }
        });
      }
    });
  }

  getData(params: any) {
    const filter = new FilterModel('id', 'equals', params.id);
    this.centerRequest.filters = [filter];
    this.centerRequest.languageCode = this.primaryLang;
    this.centerRequest.sort = [];
    this.centerRequest.pagination = {pageStart: 0, pageFetch: 10};
    let request = new RequestModel(appConstants.registrationCenterCreateId, null, this.centerRequest);
    this.centerService.getRegistrationCentersDetails(request).subscribe(response => {
      console.log(response.response.data[0]);
      this.data[0] = response.response.data[0];
      this.initializeheader();
      this.setPrimaryFormValues();
    });
    this.centerRequest.languageCode = this.secondaryLang;
    request = new RequestModel(appConstants.registrationCenterCreateId, null, this.centerRequest);
    this.centerService.getRegistrationCentersDetails(request).subscribe(response => {
      console.log(response.response.data[0]);
      this.data[1] = response.response.data[0];
      this.setSecondaryFormValues();
    });
  }

  setPrimaryFormValues() {
    this.primaryForm.controls.name.setValue(this.data[0].name);
    this.primaryForm.controls.centerTypeCode.setValue(this.data[0].centerTypeCode);
    this.primaryForm.controls.contactPerson.setValue(this.data[0].contactPerson);
    this.primaryForm.controls.contactPhone.setValue(this.data[0].contactPhone);
    this.primaryForm.controls.longitude.setValue(this.data[0].longitude);
    this.primaryForm.controls.latitude.setValue(this.data[0].latitude);
    this.primaryForm.controls.addressLine1.setValue(this.data[0].addressLine1);
    this.primaryForm.controls.addressLine2.setValue(this.data[0].addressLine2);
    this.primaryForm.controls.addressLine3.setValue(this.data[0].addressLine3);
    this.primaryForm.controls.region.setValue(this.data[0].region);
    this.primaryForm.controls.province.setValue(this.data[0].province);
    this.primaryForm.controls.city.setValue(this.data[0].city);
    this.primaryForm.controls.laa.setValue(this.data[0].localAdminAuthority);
    this.primaryForm.controls.postalCode.setValue(this.data[0].locationCode);
    this.primaryForm.controls.holidayZone.setValue(this.data[0].holidayLocationCode);
    this.primaryForm.controls.workingHours.setValue(this.data[0].workingHours.split(':')[0]);
    this.primaryForm.controls.noKiosk.setValue(this.data[0].numberOfKiosks);
    this.primaryForm.controls.processingTime.setValue(Number(this.data[0].perKioskProcessTime.split(':')[1]));
    this.primaryForm.controls.startTime.setValue(Utils.convertTimeTo12Hours(this.data[0].centerStartTime));
    this.primaryForm.controls.endTime.setValue(Utils.convertTimeTo12Hours(this.data[0].centerEndTime));
    this.primaryForm.controls.lunchStartTime.setValue(Utils.convertTimeTo12Hours(this.data[0].lunchStartTime));
    this.primaryForm.controls.lunchEndTime.setValue(Utils.convertTimeTo12Hours(this.data[0].lunchEndTime));
    this.primaryForm.controls.isActive.setValue(this.data[0].isActive);
  }

  setSecondaryFormValues() {
    this.secondaryForm.controls.name.setValue(this.data[1].name);
    this.secondaryForm.controls.centerTypeCode.setValue(this.data[1].centerTypeCode);
    this.secondaryForm.controls.contactPerson.setValue(this.data[1].contactPerson);
    this.secondaryForm.controls.contactPhone.setValue(this.data[1].contactPhone);
    this.secondaryForm.controls.longitude.setValue(this.data[1].longitude);
    this.secondaryForm.controls.latitude.setValue(this.data[1].latitude);
    this.secondaryForm.controls.addressLine1.setValue(this.data[1].addressLine1);
    this.secondaryForm.controls.addressLine2.setValue(this.data[1].addressLine2);
    this.secondaryForm.controls.addressLine3.setValue(this.data[1].addressLine3);
    this.secondaryForm.controls.region.setValue(this.data[1].region);
    this.secondaryForm.controls.province.setValue(this.data[1].province);
    this.secondaryForm.controls.city.setValue(this.data[1].city);
    this.secondaryForm.controls.laa.setValue(this.data[1].localAdminAuthority);
    this.secondaryForm.controls.postalCode.setValue(this.data[1].locationCode);
    this.secondaryForm.controls.holidayZone.setValue(this.data[1].holidayLocationCode);
    this.secondaryForm.controls.workingHours.setValue(this.data[1].workingHours.split(':')[0]);
    this.secondaryForm.controls.noKiosk.setValue(this.data[1].numberOfKiosks);
    this.secondaryForm.controls.processingTime.setValue(Number(this.data[1].perKioskProcessTime.split(':')[1]));
    this.secondaryForm.controls.startTime.setValue(Utils.convertTimeTo12Hours(this.data[1].centerStartTime));
    this.secondaryForm.controls.endTime.setValue(Utils.convertTimeTo12Hours(this.data[1].centerEndTime));
    this.secondaryForm.controls.lunchStartTime.setValue(Utils.convertTimeTo12Hours(this.data[1].lunchStartTime));
    this.secondaryForm.controls.lunchEndTime.setValue(Utils.convertTimeTo12Hours(this.data[1].lunchEndTime));
    this.secondaryForm.controls.isActive.setValue(this.data[1].isActive);
  }

  initializeheader() {
    if (this.data.length === 0) {
      this.headerObject = new CenterHeaderModel(
        '-', '-', '-', '-', '-', '-', '-'
      );
    } else {
      this.headerObject = new CenterHeaderModel(
        this.data[0].name,
        this.data[0].id,
        this.data[0].isActive ? 'Active' : 'Inactive',
        this.data[0].createdDateTime ? this.data[0].createdDateTime : '-',
        this.data[0].createdBy ? this.data[0].createdBy : '-',
        this.data[0].updatedDateTime ? this.data[0].updatedDateTime : '-',
        this.data[0].updatedBy ? this.data[0].updatedBy : '-'
      );
    }
  }

  naviagteBack() {
    this.location.back();
  }

  loadLocationData(locationCode: string, fieldName: string) {
    this.dataStorageService.getImmediateChildren(locationCode, this.primaryLang).subscribe(response => {
      // tslint:disable-next-line:no-string-literal
      this.dropDownValues[fieldName].primary = response['response']['locations'];
      console.log(this.dropDownValues);
    });
    this.dataStorageService.getImmediateChildren(locationCode, this.secondaryLang).subscribe(response => {
      // tslint:disable-next-line:no-string-literal
      this.dropDownValues[fieldName].secondary = response['response']['locations'];
    });
  }

  initializePrimaryForm() {
    this.primaryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(128)]],
      centerTypeCode: ['', [Validators.required]],
      contactPerson: ['', [Validators.maxLength(128)]],
      contactPhone: ['', [Validators.maxLength(16)]],
      longitude: ['', [Validators.required, Validators.maxLength(32), ValidateLatLong]],
      latitude: ['', [Validators.required, Validators.maxLength(32), ValidateLatLong]],
      addressLine1: ['', [Validators.required, Validators.maxLength(256)]],
      addressLine2: ['', [Validators.maxLength(256)]],
      addressLine3: ['', [Validators.maxLength(256)]],
      region: ['', [Validators.required]],
      province: ['', [Validators.required]],
      city: ['', [Validators.required]],
      laa: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      holidayZone: ['', [Validators.required]],
      workingHours: [{value: '', disabled: true}],
      noKiosk: [{value: 0, disabled: true}, [Validators.required, Validators.min(0), ValidateKiosk]],
      processingTime: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      lunchStartTime: [''],
      lunchEndTime: [''],
      isActive: [{value: false, disabled: true}]
    });
    if (this.disableForms) {
      this.primaryForm.disable();
    }
  }

  initializeSecondaryForm() {
    this.secondaryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(128)]],
      centerTypeCode: [{value: '', disabled: true}],
      contactPerson: ['', [Validators.maxLength(128)]],
      contactPhone: [{value: '', disabled: true}],
      longitude: [{value: '', disabled: true}],
      latitude: [{value: '', disabled: true}],
      addressLine1: ['', [Validators.required, Validators.maxLength(256)]],
      addressLine2: ['', [Validators.maxLength(256)]],
      addressLine3: ['', [Validators.maxLength(256)]],
      region: [{value: '', disabled: true}],
      province: [{value: '', disabled: true}],
      city: [{value: '', disabled: true}],
      laa: [{value: '', disabled: true}],
      postalCode: [{value: '', disabled: true}],
      holidayZone: [{value: '', disabled: true}],
      workingHours: [{value: '', disabled: true}],
      noKiosk: [{value: 0, disabled: true}],
      processingTime: [{value: '', disabled: true}],
      startTime: [{value: '', disabled: true}],
      endTime: [{value: '', disabled: true}],
      lunchStartTime: [{value: '', disabled: true}],
      lunchEndTime: [{value: '', disabled: true}],
      isActive: [{value: false, disabled: true}]
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
    console.log(this.primaryForm);
    console.log(this.secondaryForm);
    if (!this.disableForms) {
      if (this.primaryForm.valid && this.secondaryForm.valid) {
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
    this.dataStorageService.getStubbedDataForDropdowns().subscribe(response => {
      this.dropDownValues.centerTypeCode.primary = response[this.primaryLang].centerTypeCode;
      this.dropDownValues.centerTypeCode.secondary = response[this.secondaryLang].centerTypeCode;
      this.dropDownValues.holidayZone.primary = response[this.primaryLang].holidayZone;
      this.dropDownValues.holidayZone.secondary = response[this.secondaryLang].holidayZone;
    });
  }

  getProcessingTime() {
    this.dropDownValues.processingTime = Utils.minuteIntervals(
      appConstants.processingTimeStart,
      appConstants.processingTimeEnd,
      appConstants.processingTimeInterval);
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
    if (this.primaryForm.controls.startTime.value && this.primaryForm.controls.endTime.value) {
    const x = Utils.getTimeInSeconds(this.primaryForm.controls.endTime.value) -
              Utils.getTimeInSeconds(this.primaryForm.controls.startTime.value);
    this.primaryForm.controls.workingHours.setValue(x / 3600);
    this.secondaryForm.controls.workingHours.setValue(x / 3600);
    }
  }

  updateTimeSlotDropdownOptions(changedField: string, targetField: string, action: string) {
    const x = [...this.allSlots];
    const index = x.indexOf(this.primaryForm.controls[changedField].value);
    if (action === 'more') {
      this.dropDownValues[targetField] = x.splice(index + 1);
    } else if (action === 'less') {
      this.dropDownValues[targetField] = x.splice(0, index + 1);
    }
  }

  cancel() {
    this.router.navigateByUrl('admin/resources/centers/view');
  }

  canDeactivate(): Observable<any> | boolean {
    console.log('can deactivate called');
    if (this.primaryForm.touched || this.secondaryForm.touched) {
       return this.dialog.open(DialogComponent, {
        width: '350px',
        data: {
          case: 'CONFIRMATION',
          title:  this.popupMessages['navigation-popup'].title,
          message:  this.popupMessages['navigation-popup'].message,
          yesBtnTxt: this.popupMessages['navigation-popup'].yesBtnTxt,
          noBtnTxt: this.popupMessages['navigation-popup'].noBtnTxt
        }
      }).afterClosed();
    } else {
      return true;
    }
  }
}
