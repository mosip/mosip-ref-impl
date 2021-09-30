import {
  Component,
  ViewEncapsulation,
  ElementRef,
  ViewChildren,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
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
import * as machineSpecFile from '../../../../../assets/entity-spec/machines.json';
import { AuditService } from 'src/app/core/services/audit.service';
import { Observable } from 'rxjs';
import { MachineModel } from 'src/app/core/models/machine.model';
import { Location } from '@angular/common';
import { MachineRequest } from 'src/app/core/models/machineRequest.model';
import { MachineService } from 'src/app/core/services/machines.service';
import { CenterDropdown } from 'src/app/core/models/center-dropdown';
import { FilterRequest } from 'src/app/core/models/filter-request.model';
import { FilterValuesModel } from 'src/app/core/models/filter-values.model';
import { OptionalFilterValuesModel } from 'src/app/core/models/optional-filter-values.model';
import { HeaderService } from 'src/app/core/services/header.service';
import {
  MatKeyboardRef,
  MatKeyboardComponent,
  MatKeyboardService,
} from 'ngx7-material-keyboard';

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
  [x: string]: any;
  primaryLang: string;
  allSlots: string[];
  disableForms: boolean;
  headerObject: HeaderModel;
  dropDownValues = new CenterDropdown();
  MachineRequest = {} as MachineRequest;
  createUpdate = false;

  primaryData: any;
  secondaryData: any;

  subscribed: any;

  machineearchModel = {} as DeviceRequest;

  errorMessages: any;

  primaryForm: FormGroup;
  secondaryForm: FormGroup;

  data = [];
  popupMessages: any;
  serverError:any;
  selectedField: HTMLElement;

  private keyboardRef: MatKeyboardRef<MatKeyboardComponent>;
  @ViewChildren('keyboardRef', { read: ElementRef })
  private attachToElementMesOne: any;

  primaryKeyboard: string;

  keyboardType: string;

  days = [];

  holidayDate: any;
  minDate = new Date();
  localeDtFormat = "";
  
  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private headerService: HeaderService,
    private dataStorageService: DataStorageService,
    private translateService: TranslateService,
    private keyboardService: MatKeyboardService,
    private dialog: MatDialog,
    private statusPipe: StatusPipe,
    private auditService: AuditService,
    private machineService: MachineService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.subscribed = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });
    this.primaryLang = this.headerService.getUserPreferredLanguage();
    translateService.use(this.primaryLang);
    this.primaryKeyboard = defaultJson.keyboardMapping[this.primaryLang];
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
    this.activatedRoute.params.subscribe((params) => {
      const routeParts = this.router.url.split('/');
      if (routeParts[routeParts.length - 2] === 'single-view') {
        this.auditService.audit(8, machineSpecFile.auditEventIds[1], 'machine');
        this.disableForms = false;
        this.getData(params);
      } else {
        this.auditService.audit(20, 'ADM-130');
        this.initializeheader();
      }
    });
    this.getMachinespecifications();
    this.getSubZoneData();
    this.initializePrimaryForm();
    this.translateService
      .getTranslation(this.primaryLang)
      .subscribe(response => {
        this.popupMessages = response.machines.popupMessages;
        this.serverError = response.serverError;
      });
    let localeId = defaultJson.languages[this.primaryLang].locale;
    this.setLocaleForDatePicker(localeId);
  }

  setLocaleForDatePicker = (localeId) => {    
    this.dateAdapter.setLocale(localeId);
    let localeDtFormat = moment.localeData(localeId).longDateFormat('L');
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
        });  
      });  
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
        if(!response.errors){
          this.dropDownValues.regCenterCode.primary = response.response.registrationCenters;
        }else{
          this.dropDownValues.regCenterCode.primary = [];
        }
      });
  }

  getMachinespecifications() {
    const filterObject = new FilterValuesModel('name', 'unique', '');
    const optinalFilterObject = new OptionalFilterValuesModel('isActive', 'equals', 'true');
    const filterRequest = new FilterRequest([filterObject], this.primaryLang, [optinalFilterObject]);
    const request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('machinespecifications', request)
      .subscribe(response => {
        this.dropDownValues.machineTypeCode.primary = response.response.filters;
      });
  }

  getSubZoneData() {
    this.dataStorageService
      .getSubZoneData(this.primaryLang)
      .subscribe((response) => {
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
      name: ['', Validators.required],
      serialNumber: ['', Validators.required],
      macAddress: ['', Validators.required],
      ipAddress: ['', Validators.required],
      validity: ['', Validators.required],
      zone: ['', Validators.required],
      publicKey: ['', Validators.required],
      signPublicKey: ['', Validators.required],
      machineSpecId: ['', Validators.required],
      regCenterId: ['']
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
    this.dialog
      .open(DialogComponent, {
        width: '650px',
        data: {
          case: 'MESSAGE',
        },
        disableClose: true,
      })
      .afterClosed()
      .subscribe(() =>
        this.router.navigateByUrl('admin/resources/machine/view')
      );
  }

  setPrimaryData() {
    this.primaryForm.controls.name.setValue(this.primaryData.name);
    this.primaryForm.controls.serialNumber.setValue(this.primaryData.serialNum);
    this.primaryForm.controls.macAddress.setValue(this.primaryData.macAddress);
    this.primaryForm.controls.ipAddress.setValue(this.primaryData.ipAddress);
    this.primaryForm.controls.validity.setValue(
      this.primaryData.validityDateTime
    );
    this.primaryForm.controls.zone.setValue(this.primaryData.zoneCode);
    this.primaryForm.controls.machineSpecId.setValue(
      this.primaryData.machineSpecId
    );
    this.primaryForm.controls.publicKey.setValue(this.primaryData.publicKey);
    this.primaryForm.controls.signPublicKey.setValue(this.primaryData.signPublicKey);
    this.primaryForm.controls.regCenterId.setValue(this.primaryData.regCenterId);
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
          width: '650px',
          data: {
            case: 'CONFIRMATION',
            title: this.popupMessages['navigation-popup'].title,
            message: this.popupMessages['navigation-popup'].message,
            yesBtnTxt: this.popupMessages['navigation-popup'].yesBtnTxt,
            noBtnTxt: this.popupMessages['navigation-popup'].noBtnTxt,
          },
        })
        .afterClosed();
    } else {
      return true;
    }
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

  onCreate() {
    let data = {};
    if (this.data.length === 0) {
        data = {
          case: 'CONFIRMATION',
          title: this.popupMessages['create'].title,
          message: this.popupMessages['create'].message[0]+ this.primaryForm.controls.name.value + this.popupMessages['create'].message[1],
          yesBtnTxt: this.popupMessages['create'].yesBtnText,
          noBtnTxt: this.popupMessages['create'].noBtnText,
        };
      } else {
        data = {
          case: 'CONFIRMATION',
          title: this.popupMessages['edit'].title,
          message: this.popupMessages['edit'].message,
          yesBtnTxt: this.popupMessages['edit'].yesBtnText,
          noBtnTxt: this.popupMessages['edit'].noBtnText,
        };
      }
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '650px',
      data,
    });
    dialogRef.afterClosed().subscribe((response) => {
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
    const primaryObject = new MachineModel(
      this.primaryForm.controls.zone.value,
      this.primaryForm.controls.validity.value,
      this.primaryForm.controls.name.value,
      this.primaryForm.controls.machineSpecId.value,
      this.primaryForm.controls.macAddress.value,
      this.primaryForm.controls.serialNumber.value,
      this.primaryForm.controls.ipAddress.value,
      this.primaryForm.controls.publicKey.value,
      this.primaryForm.controls.signPublicKey.value,
      this.primaryForm.controls.regCenterId.value,
      '0',
      true
    );
    const primaryRequest = new RequestModel(
      appConstants.registrationMachineCreateId,
      null,
      primaryObject
    );
    this.dataStorageService
      .createMachine(primaryRequest)
      .subscribe((createResponse) => {
        if (!createResponse.errors) {      
              this.showMessage('create-success', createResponse.response)
                .afterClosed()
                .subscribe(() => {
                  this.primaryForm.reset();
                  this.router.navigateByUrl('admin/resources/machines/view');
                });
            } else {
          this.showMessage('create-error', createResponse);
        }
      });
  }

  updateData() {
    this.createUpdate = true;
    const primaryObject = new MachineModel(
      this.primaryForm.controls.zone.value,
      this.primaryForm.controls.validity.value,
      this.primaryForm.controls.name.value,
      this.primaryForm.controls.machineSpecId.value,
      this.primaryForm.controls.macAddress.value,
      this.primaryForm.controls.serialNumber.value,
      this.primaryForm.controls.ipAddress.value,
      this.primaryForm.controls.publicKey.value,
      this.primaryForm.controls.signPublicKey.value,
      this.primaryForm.controls.regCenterId.value,
      this.data[0].id
    );
   
    const primaryRequest = new RequestModel(
      appConstants.registrationMachineCreateId,
      null,
      primaryObject
    );
    this.dataStorageService
      .updateData(primaryRequest)
      .subscribe((createResponse) => {
        if (!createResponse.errors) {
            this.showMessage('update-success', createResponse.response)
              .afterClosed()
              .subscribe(() => {
                this.primaryForm.reset();
                this.router.navigateByUrl('admin/resources/machines/view');
              });
             } else {
          this.showMessage('update-error', createResponse);
        }
      });
  }

  getData(params: any) {
    const filter = new FilterModel('id', 'equals', params.id);
    this.MachineRequest.filters = [filter];
    this.MachineRequest.languageCode = this.primaryLang;
    this.MachineRequest.sort = [];
    this.MachineRequest.pagination = { pageStart: 0, pageFetch: 10 };
    const request = new RequestModel(
      appConstants.registrationMachineCreateId,
      null,
      this.MachineRequest
    );
    this.machineService.getRegistrationMachinesDetails(request).subscribe(
      (response) => {
        if (response.response.data) {
          this.data[0] = response.response.data[0];
          this.initializeheader();
          this.setPrimaryFormValues();
          }
        if (this.activatedRoute.snapshot.queryParams.editable === 'true') {
            this.disableForms = false;
            this.primaryForm.enable();            
          } else {
        }
      },
      (error) => this.showErrorPopup()
    );
  }

  setPrimaryFormValues() {
    this.primaryForm.controls.zone.setValue(this.data[0].zoneCode);
    this.primaryForm.controls.validity.setValue(this.data[0].validityDateTime);
    this.primaryForm.controls.name.setValue(this.data[0].name);
    this.primaryForm.controls.macAddress.setValue(this.data[0].macAddress);
    this.primaryForm.controls.serialNumber.setValue(this.data[0].serialNum);
    this.primaryForm.controls.ipAddress.setValue(this.data[0].ipAddress);
    this.primaryForm.controls.publicKey.setValue(this.data[0].publicKey);
    this.primaryForm.controls.signPublicKey.setValue(this.data[0].signPublicKey);
    this.primaryForm.controls.machineSpecId.setValue(
      this.data[0].machineSpecId
    );
    this.primaryForm.controls.regCenterId.setValue(this.data[0].regCenterId);
  }

  showMessage(type: string, data ?: any) {
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
        btnTxt: this.popupMessages[type].btnTxt,
      },
    });
    return dialogRef;
  }

  showErrorPopup() {
    this.dialog
      .open(DialogComponent, {
        width: '650px',
        data: {
          case: 'MESSAGE',
          title: this.popupMessages['noData']['title'],
          message: this.popupMessages['noData']['message'],
          btnTxt: this.popupMessages['noData']['btnTxt'],
        },
        disableClose: true,
      })
      .afterClosed()
      .subscribe(() =>
        this.router.navigateByUrl(`admin/resources/machines/view`)
      );
  }
}
