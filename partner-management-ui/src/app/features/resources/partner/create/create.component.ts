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
import * as partnerSpecFile from '../../../../../assets/entity-spec/partner.json';
import { stringify } from 'querystring';
import { PartnerModel } from 'src/app/core/models/partner.model';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent {

  localID : string;
  minvalue : number = 0;
  filtersApplied = false;
  sortFilter = [];
  requestModel: RequestModel;
  primaryLang: string;
  dropDownValues = new CenterDropdown();
  allSlots: string[];
  disableForms: boolean;
  headerObject: HeaderModel;
  centerRequest = {} as CenterRequest;
  createUpdate = false;
  primaryForm: FormGroup;
  data = [];
  popupMessages: any;
  selectedField: HTMLElement;

  private keyboardRef: MatKeyboardRef<MatKeyboardComponent>;
  @ViewChildren('keyboardRef', { read: ElementRef })
  private attachToElementMesOne: any;
  primaryKeyboard: string;
  keyboardType: string;
  subscribed: any;

  constructor(
    private appService: AppConfigService,
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
    this.primaryLang = appConfigService.getConfig()['primaryLangCode'];
    translateService.use(this.primaryLang);
    this.primaryKeyboard = appConstants.keyboardMapping[this.primaryLang];
    this.loadLocationData('MOR', 'region');
  }

  initializeComponent() {
    this.activatedRoute.params.subscribe(params => {
      const routeParts = this.router.url.split('/');
      if (routeParts[routeParts.length - 2] === 'single-view') {
        this.auditService.audit(8, partnerSpecFile.auditEventIds[1], 'partner');
        this.disableForms = true;
        this.getData(params);
      } else {
        this.auditService.audit(16, 'ADM-096');
        this.initializeheader();
      }
    });
    this.initializePrimaryForm();
    this.getStubbedData();
    this.getZoneData();
    this.translateService
      .getTranslation(this.primaryLang)
      .subscribe(response => {
        this.popupMessages = response.partner.popupMessages;
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

  onCreate() {
    let data = {};
    if (true) {
      data = {
        case: 'CONFIRMATION',
        title: this.popupMessages['create'].title,
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
    if (this.data.length === 0) {
      this.auditService.audit(18, 'ADM-104', 'create');
      this.saveData();
    } else if (this.data.length !== 0) {
      this.auditService.audit(18, 'ADM-105', 'edit');
      this.updateData();
    }
  }

  updateData() {
    this.createUpdate = true;
    const primaryObject = new PartnerModel(
      this.primaryForm.value.name,
      null,
      this.primaryForm.value.contactPhone,
      this.primaryForm.value.contactPerson,
      this.primaryForm.value.addressLine1,
    );
    const request = new RequestModel(
      appConstants.registrationUpdatePartnerId,
      null,
      primaryObject
    );
    console.log(request);
      this.dataStorageService.updatePartner(request , this.localID).subscribe(updateResponse => {
      console.log(updateResponse);
      if (!updateResponse.errors || updateResponse.errors.length === 0) {
          this.showMessage('update-success');
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
              data.partnerId +
              this.popupMessages[type].message[1] +
              data.status
            : this.popupMessages[type].message,
        btnTxt: this.popupMessages[type].btnTxt
      }
    }).afterClosed().subscribe(() => this.router.navigateByUrl(`admin/resources/partner/view`));
    return dialogRef;
  }
  saveData() {
    this.createUpdate = true;
    const primaryObject = new PartnerModel(
      this.primaryForm.value.name,
      this.primaryForm.value.partnerTypeCode,
      this.primaryForm.value.contactPhone,
      this.primaryForm.value.contactPerson,
      this.primaryForm.value.addressLine1,
    );
    const primaryRequest = new RequestModel(
      appConstants.registrationCreatePartnerId,
      null,
      primaryObject
    );
    console.log(primaryRequest);
    this.dataStorageService
      .createPartner(primaryRequest)
      .subscribe(createResponse => {
        console.log(createResponse);
        if (!createResponse.errors) {
          this.showMessage('create-success', createResponse.response);
          } else {
            //this.showMessage('create-success', createResponse.response);
            this.showMessage('create-error');
          }
        }
      );
  }

  async getData(params: any) {

    this.localID = params.id;
    const filter = new FilterModel('PartnerID', 'equals', params.id);
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
        console.log("Reponse are: " + response);
        if (response.response.partners) {

          for(let index = this.minvalue; index <= response.response.partners.length ; index++){
            if(response.response.partners[index].partnerID == this.localID){
              console.log("localID Value:" + this.localID);
              console.log("partnerID Value:" + response.response.partners[index].partnerID);
              this.data[0] = response.response.partners[index];
              this.initializeheader();
              this.setPrimaryFormValues();
            }
              
          }
          request = new RequestModel(
            appConstants.registrationCenterCreateId,
            null,
            this.centerRequest
          );
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
      }).afterClosed().subscribe(() => this.router.navigateByUrl(`admin/resources/partner/view`));
  }

  setPrimaryFormValues() {
    this.primaryForm.controls.name.setValue(this.data[0].organizationName);
    this.primaryForm.controls.contactPhone.setValue(this.data[0].contactNumber);
    this.primaryForm.controls.partnerTypeCode.setValue(this.data[0].policyName);
    this.primaryForm.controls.contactPerson.setValue(this.data[0].emailId);
    this.primaryForm.controls.addressLine1.setValue(this.data[0].address);
  }

  initializeheader() {
    if (this.data.length === 0) {
      this.headerObject = new HeaderModel('-', '-', '-', '-', '-', '-', '-');
    } else {
      this.headerObject = new HeaderModel(
        //this.data[0].name,
        this.data[0].organizationName,
        this.data[0].createdDateTime ? this.data[0].createdDateTime : '-',
        this.data[0].createdBy ? this.data[0].createdBy : '-',
        this.data[0].updatedDateTime ? this.data[0].updatedDateTime : '-',
        this.data[0].updatedBy ? this.data[0].updatedBy : '-',
        //this.data[0].id,
        this.data[0].partnerID,
        //this.data[0].isActive
        this.data[0].status
      );
      console.log("headerObject: " + this.headerObject);
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
      this.primaryForm.controls[locationFields[i]].markAsUntouched();
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
  }

  initializePrimaryForm() {
    this.primaryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(128)]],
      partnerTypeCode: ['', [Validators.required]],
      contactPerson: ['', [Validators.maxLength(128)]],
      contactPhone: ['', [Validators.maxLength(16)]],
      addressLine1: ['', [Validators.required, Validators.maxLength(256)]],
    });
    if (this.disableForms) {
      this.primaryForm.disable();
    }
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
    }
  }
  getStubbedData() {
    this.getRegistrationCenterTypes();
    this.dataStorageService.getStubbedDataForDropdowns().subscribe(response => {
      this.dropDownValues.holidayZone.primary =
        response[this.primaryLang].holidayZone;
    });
  }
  getRegistrationCenterTypes() {
    const filterObject = new FilterValuesModel('name', 'unique', '');
    let filterRequest = new FilterRequest([filterObject], this.primaryLang);
    let request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('registrationcentertypes', request)
      .subscribe(response => {
        this.dropDownValues.partnerTypeCode.primary = response.response.filters;
      });
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

  validateAndLoadLunchTime(fieldName: string) {
    if (this.primaryForm.controls.startTime.valid && this.primaryForm.controls.endTime.valid) {
      if (fieldName === 'lunchStartTime') {
        const x = [...this.allSlots];
        const startIndex = x.indexOf(this.primaryForm.controls.startTime.value) + 1;
        if (this.primaryForm.controls.lunchEndTime.value !== '') {
          const endIndex = x.indexOf(this.primaryForm.controls.lunchEndTime.value);
          this.dropDownValues.lunchStartTime = x.slice(startIndex, endIndex);
        } else {
          const endIndex = x.indexOf(this.primaryForm.controls.endTime.value);
          this.dropDownValues.lunchStartTime = x.slice(startIndex, endIndex);
        }
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
}
