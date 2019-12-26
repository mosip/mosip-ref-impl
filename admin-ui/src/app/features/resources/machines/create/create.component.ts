import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AppConfigService } from 'src/app/app-config.service';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { FilterModel } from 'src/app/core/models/filter.model';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { RequestModel } from 'src/app/core/models/request.model';
import * as appConstants from '../../../../app.constants';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import { HeaderModel } from 'src/app/core/models/header.model';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { StatusPipe } from 'src/app/shared/pipes/status.pipe';
import * as machineSpecFile from '../../../../../assets/entity-spec/machines.json';
import { AuditService } from 'src/app/core/services/audit.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent implements OnInit, OnDestroy {
  primaryForm: FormGroup;
  secondaryForm: FormGroup;

  primaryData: any;
  secondaryData: any;

  primaryLang: string;
  secondaryLang: string;

  subscribed: any;
  headerObject: HeaderModel;

  machinesSearchModel = {} as CenterRequest;

  showSpinner = false;

  secondaryLanguageLabels: any;
  errorMessages: any;
  showSecondaryForm: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appService: AppConfigService,
    private dataService: DataStorageService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private statusPipe: StatusPipe,
    private auditService: AuditService
  ) {
    // tslint:disable-next-line:no-string-literal
    this.primaryLang = appService.getConfig()['primaryLangCode'];
    // tslint:disable-next-line:no-string-literal
    this.secondaryLang = appService.getConfig()['secondaryLangCode'];
    this.primaryLang === this.secondaryLang ? this.showSecondaryForm = false : this.showSecondaryForm = true;
    this.subscribed = this.router.events.subscribe(async event => {
      if (event instanceof NavigationEnd) {
        this.showSpinner = true;
        await this.getData(this.primaryLang, true);
        if (this.showSecondaryForm) {
          await this.getData(this.secondaryLang, false);
        }
        this.showSpinner = false;
        console.log(this.primaryData, this.secondaryData);
      }
    });
  }

  async ngOnInit() {
    this.auditService.audit(8, machineSpecFile.auditEventIds[1], 'machines');
    this.initializePrimaryForm();
    if (this.showSecondaryForm) {
    this.initializeSecondaryForm();
    }
    this.getSecondaryLanguageLabelsAndErrorLabels();
  }

  getSecondaryLanguageLabelsAndErrorLabels() {
    this.translateService
      .getTranslation(this.secondaryLang)
      .subscribe(response => {
        this.secondaryLanguageLabels = response.machines;
      });
    this.translateService.getTranslation(this.primaryLang).subscribe(response => {
      this.errorMessages = response.machines.errorMessages;
    });
  }

  initializePrimaryForm() {
    this.primaryForm = this.formBuilder.group({
      name: [''],
      serialNumber: [''],
      macAddress: [''],
      ipAddress: [''],
      validity: [''],
      isActive: [''],
      zone: [''],
      machineSpecId: ['']
    });
    this.primaryForm.disable();
  }

  initializeSecondaryForm() {
    this.secondaryForm = this.formBuilder.group({
      name: [''],
      serialNumber: [''],
      macAddress: [''],
      ipAddress: [''],
      validity: [''],
      isActive: [''],
      zone: [''],
      machineSpecId: ['']
    });
    this.secondaryForm.disable();
  }

  get primary() {
    return this.primaryForm.controls;
  }

  get secondary() {
    return this.secondaryForm.controls;
  }

  getData(langCode: string, isPrimary: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this.machinesSearchModel.filters = [
        new FilterModel('id', 'equals', this.activatedRoute.snapshot.params.id)
      ];
      this.machinesSearchModel.languageCode = langCode;
      this.machinesSearchModel.sort = [];
      this.machinesSearchModel.pagination = new PaginationModel(0, 10);
      console.log(this.machinesSearchModel);
      this.dataService
        .getMachinesData(
          new RequestModel(appConstants.IDS, null, this.machinesSearchModel)
        )
        .subscribe(response => {
          if (response.response.data) {
            if (isPrimary) {
              this.primaryData = response.response.data[0];
              this.setPrimaryData();
              this.setHeaderData();
            } else {
              this.secondaryData = response.response.data[0];
              this.setSecondaryData();
            }
            resolve(true);
          } else {
            this.showError();
          }
        }, error => this.showError());
    });
  }

  showError() {
    this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        case: 'MESSAGE',
        title: this.errorMessages.title,
        message: this.errorMessages.message,
        btnTxt: this.errorMessages.btnTxt
      },
      disableClose: true
    }).afterClosed().subscribe(() => this.router.navigateByUrl('admin/resources/machines/view'));
  }

  setPrimaryData() {
    this.primaryForm.controls.name.setValue(this.primaryData.name);
    this.primaryForm.controls.serialNumber.setValue(this.primaryData.serialNum);
    this.primaryForm.controls.macAddress.setValue(this.primaryData.macAddress);
    this.primaryForm.controls.ipAddress.setValue(this.primaryData.ipAddress);
    this.primaryForm.controls.validity.setValue(
      this.primaryData.validityDateTime
    );
    this.primaryForm.controls.isActive.setValue(this.statusPipe.transform(this.primaryData.isActive));
    this.primaryForm.controls.zone.setValue(this.primaryData.zone);
    this.primaryForm.controls.machineSpecId.setValue(this.primaryData.machineSpecId);
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
    this.secondaryForm.controls.machineSpecId.setValue(this.secondaryData.machineSpecId);
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
}
