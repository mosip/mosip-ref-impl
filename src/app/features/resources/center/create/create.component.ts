import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { CenterHeaderModel } from 'src/app/core/models/center-header.model';
import { CenterModel } from 'src/app/core/models/center.model';
import { RequestModel } from 'src/app/core/models/request.model';

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

  primaryForm: FormGroup;
  secondaryForm: FormGroup;

  constructor(private location: Location,
              private translateService: TranslateService,
              private dataStorageService: DataStorageService,
              private dialog: MatDialog,
              private formBuilder: FormBuilder,
              private appConfigService: AppConfigService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
                   // tslint:disable-next-line:no-string-literal
                   this.primaryLang = appConfigService.getConfig()['primaryLangCode'];
                   // tslint:disable-next-line:no-string-literal
                   this.secondaryLang = appConfigService.getConfig()['secondaryLangCode'];
                   translateService.use(this.primaryLang);
                   this.loadLocationData('MOR', 'region');
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const routeParts = this.router.url.split('/');
      if (routeParts[routeParts.length - 2] === 'single-view') {
        this.disableForms = true;
        this.getData();
      } else {
        this.headerObject = new CenterHeaderModel(
          '-', '-', '-', '-', '-', '-', '-'
        );
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
  }

  onCreate() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        case: 'CONFIRMATION',
        title: 'Confirmation',
        message: 'Click On yes To Create Center',
        yesBtnTxt: 'Yes',
        noBtnTxt: 'No'
      }
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
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
        const request = new RequestModel(
          appConstants.registrationCenterCreateId, null, [primaryObject, secondaryObject]
        );
        console.log(request);
        this.dataStorageService.createCenter(request).subscribe(createResponse => {
          console.log(createResponse);
          if (!response.error) {
            this.dialog.open(DialogComponent, {
              width: '350px',
              data: {
                case: 'MESSAGE',
                title: 'Success',
                message: 'Center is created Successfully with Center ID: ' + createResponse.response.registrationCenters[0].id,
                btnTxt: 'Ok'
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
                title: 'Error',
                message: 'There was some issue in creating a center. Please try again',
                btnTxt: 'Ok'
              }
            });
          }
        });
      }
    });
  }

  getData() {
    console.log('Get Data Called');
    this.headerObject = new CenterHeaderModel(
      '-', '-', '-', '-', '-', '-', '-'
    );
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
      lunchEndTime: ['']
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
      lunchEndTime: [{value: '', disabled: true}]
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
      this.primaryForm.controls.noKiosk.enable();
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

}
