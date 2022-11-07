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
import * as deviceSpecFile from '../../../../../assets/entity-spec/pmanager.json';
import { AuditService } from 'src/app/core/services/audit.service';
import { Location } from '@angular/common';
import { PolicyUpdateRequest } from 'src/app/core/models/policyrequest.model';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent implements OnInit, OnDestroy {
  primaryForm: FormGroup;
  primaryData: any;
  primaryLang: string;
  subscribed: any;
  headerObject: HeaderModel;
  deviceSearchModel = {} as CenterRequest;
  showSpinner = false;
  errorMessages: any;
  disableForms: boolean;
  requestModel :RequestModel;
  minvalue : number = 0;
  policyRequest:PolicyUpdateRequest;
  newPolicyID:string;
  popupMessages: any;

  constructor(
    private location: Location,
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
    this.primaryLang = appService.getConfig()['primaryLangCode'];
    this.subscribed = this.router.events.subscribe(async event => {
      if (event instanceof NavigationEnd) {
        this.showSpinner = true;
        //this.updatePartnerPolicy();
        this.disableForms = true;
        await this.getData(this.primaryLang, true);
        this.showSpinner = false;
        console.log(this.primaryData);
      }
    });
  }

  async ngOnInit() {
    this.auditService.audit(8, deviceSpecFile.auditEventIds[1], 'pmanager');
    this.initializePrimaryForm();
    this.translateService
      .getTranslation(this.primaryLang)
      .subscribe(response => {
        this.popupMessages = response.pmanager.popupMessages;
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
      zone: ['']
    });
    this.primaryForm.disable();
  }

  get primary() {
    return this.primaryForm.controls;
  }

  getData(langCode: string, isPrimary: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this.deviceSearchModel.filters = [
        new FilterModel('id', 'equals', this.activatedRoute.snapshot.params.id)
      ];
      this.deviceSearchModel.languageCode = langCode;
      this.deviceSearchModel.sort = [];
      this.deviceSearchModel.pagination = new PaginationModel(0, 10);
      console.log(this.deviceSearchModel);
      this.requestModel = new RequestModel(
          appConstants.registrationUpdatePartnerId, 
          null, 
          this.deviceSearchModel);
          console.log(this.requestModel);
      this.dataService
        .getPartnerManagerData(this.requestModel)
        .subscribe(response => {
          console.log(response.response.partners);
          if (response.response.partners) {
            if (isPrimary) {
              for(let index = this.minvalue; index <= response.response.partners.length - 1 ; index++){
                if(response.response.partners[index].partnerID == this.activatedRoute.snapshot.params.id){
                  this.primaryData = response.response.partners[index];
                  console.log(this.primaryData);
                  this.setPrimaryData();
                  this.setHeaderData();
                }
              }
            } else {
             
            }
            resolve(true);
          } else {
            this.showError();
          }
        }, error => this.showError());
    });
  }

  cancel() {
    this.location.back();
  }
  
  async updatePartnerPolicy(){
     console.log("before New Policy Name: " + this.primaryForm.value.name);
     this.newPolicyId();
     console.log("after New Policy Name: " + this.primaryForm.value.name);
    if (!this.disableForms) {
      this.auditService.audit(17, 'ADM-097');
      if (this.primaryForm.valid) {
        await this.updatePolicy();
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

  newPolicyId(){
    console.log("New Policy Name: " + this.primaryForm.value.name);
    this.dataService.getPolicyID(this.primaryForm.value.name)
    .subscribe(data => {
      console.log("Response policyID is: " + data.response.policyID);
      this.newPolicyID = data.response.policyID;
      console.log("newPolicyId(): New Policy Id: "+this.newPolicyID);
    })
  }
  
   updatePolicy(){

    if(this.primaryForm.value.name == 'Banking'){
      this.newPolicyID =  "567459";
    }
    if(this.primaryForm.value.name == 'Telecom'){
      this.newPolicyID =  "567458";
    }

   //this.newPolicyId();

    console.log("New Policy Id: "+this.newPolicyID);
    this.policyRequest = new PolicyUpdateRequest(
      this.primaryData.policyID,
      this.newPolicyID
    );
    console.log(this.policyRequest);
    const request = new RequestModel(
      appConstants.registrationUpdatePartnerId,
      null,
      this.policyRequest
    );
    console.log(request);
     this.dataService.updatePaPolicy(request , this.primaryData.partnerID , this.primaryData.partnerAPIKey)
    .subscribe(updateResponse => {
      console.log("Response is: " + updateResponse.response.message);
      console.log("Response Error is: " + updateResponse.errors);
      if (!updateResponse.errors || updateResponse.errors.length === 0) {
        this.showMessage('update-success',updateResponse.response);
      }else{
        this.showMessage('update-error');
      }
    })
  }

  showMessage(type: string, data?: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        case: 'MESSAGE',
        title: this.popupMessages[type].title,
        message:
          type === 'update-success'
            ? this.popupMessages[type].message
            : this.popupMessages[type].message,
        btnTxt: this.popupMessages[type].btnTxt
      }
    }).afterClosed().subscribe(() => this.router.navigateByUrl(`admin/resources/pmanager/view`));
    return dialogRef;
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
    }).afterClosed().subscribe(() => this.router.navigateByUrl('admin/resources/pmanager/view'));
  }

  setPrimaryData() {
    console.log(this.primaryForm);
    console.log(this.primaryData);
    this.primaryForm.controls.name.setValue(this.primaryData.policyName);
  }

  setHeaderData() {
    this.headerObject = new HeaderModel(
      this.primaryData.policyName,
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
