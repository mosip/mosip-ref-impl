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

  primaryForm: FormGroup;
  secondaryForm: FormGroup;

  constructor(private location: Location,
              private translateService: TranslateService,
              private dataStorageService: DataStorageService,
              private dialog: MatDialog,
              private formBuilder: FormBuilder,
              private appConfigService: AppConfigService) {
                   // tslint:disable-next-line:no-string-literal
                   this.primaryLang = appConfigService.getConfig()['primaryLangCode'];
                   // tslint:disable-next-line:no-string-literal
                   this.secondaryLang = appConfigService.getConfig()['secondaryLangCode'];
                   translateService.use(this.primaryLang);
                   this.loadLocationData('MOR', 'region');
  }

  ngOnInit() {
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
      console.log('response', response);
    });
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
    if (this.primaryForm.valid && this.secondaryForm.valid) {
      this.onCreate();
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
