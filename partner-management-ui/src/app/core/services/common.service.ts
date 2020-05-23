import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataStorageService } from './data-storage.service';
import { MatDialog } from '@angular/material';
import { AppConfigService } from 'src/app/app-config.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { RequestModel } from '../models/request.model';
import * as appConstants from '../../app.constants';
import { CenterModel } from '../models/center.model';
import { AuditService } from './audit.service';
import { MispModel } from '../models/misp.model';
import { PolicyModel } from '../models/policy.model';
import { PartnerSubmitReq } from '../models/partnersubmitreq.model';
import { PartnerStatus } from '../models/partnerstatus.model';
import { CreateAuthPolicy } from '../models/createauthpolicy.model';
import { AuthPolicies } from '../models/authpolicies.model';
import { AllowedKycAttributes } from '../models/allowedkycattributes.model';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  actionMessages: any;
  useCaseDescription : string = 'useCaseDescription';
  partnerSubmitReq : PartnerSubmitReq;
  createAuthPolicy : CreateAuthPolicy;
  partnerStatus : PartnerStatus;
  authPolicies: AuthPolicies[];
  allowedKycAttributes: AllowedKycAttributes[];
  active : string = "Active";
  deactive : string = "De-Active";
  approved : string = "Approved";
  rejected : string = "Rejected";
  descr: string;
  constructor(
    private router: Router,
    private dataService: DataStorageService,
    private dialog: MatDialog,
    private appService: AppConfigService,
    private translate: TranslateService,
    private auditService: AuditService
  ) {
    translate
      .getTranslation(appService.getConfig().primaryLangCode)
      .subscribe(result => {
        this.actionMessages = result.actionMessages;
      });
  }

  private showMessage(data: any) {
    this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        case: 'MESSAGE',
        ...data
      }
    }).afterClosed().subscribe(() => this.router.navigateByUrl(`admin/resources/partner/view`));
  }

  private confirmationPopup(type: string, data: any) {
    const obj = {
      case: 'CONFIRMATION',
      title: this.actionMessages[type]['confirmation-title'],
      message: this.actionMessages[type]['confirmation-message'][0] + data + this.actionMessages[type]['confirmation-message'][1],
      yesBtnTxt: this.actionMessages[type]['yesBtnTxt'],
      noBtnTxt: this.actionMessages[type]['noBtnTxt']
    };
    return this.dialog.open(DialogComponent, {
      width: '350px',
      data: obj
    });
  }

  private createMessage(type: string, listItem: string, data?: any) {
    let obj = {};
    if (type === 'success') {
      obj = {
        title: this.actionMessages[listItem]['success-title'],
        message: this.actionMessages[listItem]['success-message'][0] + data + this.actionMessages[listItem]['success-message'][1],
        btnTxt: this.actionMessages[listItem]['btnTxt']
      };
    } else if (type === 'error') {
      obj = {
        title: this.actionMessages[listItem]['error-title'],
        message: this.actionMessages[listItem]['error-message'],
        btnTxt: this.actionMessages[listItem]['btnTxt']
      };
    }
    this.showMessage(obj);
  }

  private updateMisp(callingFunction: string, data: MispModel) {
    const request = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      data
    );
    this.dataService.updateMisp(request).subscribe(
      response => {
        if (!response.errors || response.errors.length === 0) {
          this.createMessage('success', callingFunction, request.request.name);
          this.router.navigateByUrl(this.router.url);
        } else {
          this.createMessage('error', callingFunction);
        }
      },
      error => this.createMessage('error', callingFunction)
    );
  }

  private updatePolicy(callingFunction: string, data: PolicyModel) {
    const request = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      data
    );
    this.dataService.updatePolicyStatus(request).subscribe(
      response => {
        if (!response.errors || response.errors.length === 0) {
          this.createMessage('success', callingFunction, request.request.name);
          this.router.navigateByUrl(this.router.url);
        } else {
          this.createMessage('error', callingFunction);
        }
      },
      error => this.createMessage('error', callingFunction)
    );
  }

  private approveMisp(callingFunction: string, data: MispModel) {
    const request = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      data
    );
    this.dataService.approveMisp(request).subscribe(
      response => {
        if (!(response['errors'].length != 0)) {
          this.createMessage('success', 'decommission', data.name);
          if (this.router.url.indexOf('single-view') >= 0) {
            this.router.navigateByUrl('admin/resources/misp/view');
          } else {
            this.router.navigateByUrl(this.router.url);
          }
        } else {
          this.createMessage('error', 'decommission');
        }
      },
      error => {
        this.createMessage('error', 'decommission');
      }
    ); 
  }

  private mapDataToObject(data: any): MispModel {
    const primaryObject = new MispModel(
      data.name,
      data.address,
      data.contactNumber,
      data.emailId,
      data.isActive,
      data.id,
      data.mispStatus    
    );
    return primaryObject;
  }

  private mapDataToPolicyObject(data: any): PolicyModel {
    const primaryObject = new PolicyModel(
      data.name,
      data.desc,
      data.isActive,
      data.id    
    );
    return primaryObject;
  }

  edit(data: any, url: string, idKey: string) {
    this.auditService.audit(9, 'ADM-084', {
      buttonName: 'edit',
      masterdataName: this.router.url.split('/')[
        this.router.url.split('/').length - 2
      ]
    });
    url = url.replace('$id', data[idKey]);
    this.router.navigateByUrl(url + '?editable=true');
  }

  policyEdit(data: any, url: string, idKey: string) {
    this.auditService.audit(9, 'ADM-084', {
      buttonName: 'edit',
      masterdataName: this.router.url.split('/')[
        this.router.url.split('/').length - 2
      ]
    });
    url = url.replace('$id', data[idKey]);
    this.router.navigateByUrl(url + '?editable=true');
  }

  partnerEdit(data: any, url: string, idKey: string) {
    this.auditService.audit(9, 'ADM-084', {
      buttonName: 'edit',
      masterdataName: this.router.url.split('/')[
        this.router.url.split('/').length - 2
      ]
    });
    url = url.replace('$id', data[idKey]);
    this.router.navigateByUrl(url + '?editable=true');
  }

  pmanagerEdit(data: any, url: string, idKey: string) {
    this.auditService.audit(9, 'ADM-084', {
      buttonName: 'edit',
      masterdataName: this.router.url.split('/')[
        this.router.url.split('/').length - 2
      ]
    });
    url = url.replace('$id', data[idKey]);
    this.router.navigateByUrl(url + '?editable=true');
  }


  submitPartnerAPIKeyRequest(data: any){
    this.partnerSubmitReq = new PartnerSubmitReq(
      data.policyName,
      this.useCaseDescription
    );
    const request = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      this.partnerSubmitReq
    );
    console.log("Request is:"+ request);
    this.dataService.submitRequest(request , data.partnerID).subscribe(dataa =>{

      if (!dataa['errors']) {
        this.createMessage('success', 'activate', data.organizationName);
      } else {
        this.createMessage('error', 'activate');
      }
      
    });
  }

  activatePartner(data: any){
    this.partnerStatus = new PartnerStatus(
      this.active
      //data.partnerStatus,
    );
    const request = new RequestModel(
      appConstants.registrationUpdatePartnerId,
      null,
      this.partnerStatus
    );
    console.log("Request is:"+ request);
    this.dataService.activatePartnerStatus(request , data.partnerID).subscribe(dataa =>{

      if (!dataa['errors']) {
        this.createMessage('success', 'activate', data.organizationName);
      } else {
        this.createMessage('error', 'activate');
      }
      
    });
  }

  deactivatePartner(data: any){
    this.partnerStatus = new PartnerStatus(
      //data.partnerStatus,
      this.deactive
    );
    const request = new RequestModel(
      appConstants.registrationUpdatePartnerId,
      null,
      this.partnerStatus
    );
    console.log("Request is:"+ request);
    this.dataService.activatePartnerStatus(request , data.partnerID).subscribe(dataa =>{

      if (!dataa['errors']) {
        this.createMessage('success', 'activate', data.organizationName);
      } else {
        this.createMessage('error', 'activate');
      }
      
    });
  }

  approvePartnerRequestStatus(data: any){
    this.partnerStatus = new PartnerStatus(
      //data.partnerStatus,
      this.approved
    );
    const request = new RequestModel(
      appConstants.registrationUpdatePartnerId,
      null,
      this.partnerStatus
    );
    console.log("Request is:"+ request);
    this.dataService.approvePartnerRequest(request , data.apikeyReqID).subscribe(dataa =>{

      if (!dataa['errors']) {
        this.createMessage('success', 'activate', data.apikeyReqID);
      } else {
        this.createMessage('error', 'activate');
      }
      
    });
  }

  rejectPartnerRequestStatus(data: any){
    this.partnerStatus = new PartnerStatus(
      //data.partnerStatus,
      this.rejected
    );
    const request = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      this.partnerStatus
    );
    console.log("Request is:"+ request);
    this.dataService.approvePartnerRequest(request , data.apikeyReqID).subscribe(dataa =>{

      if (!dataa['errors']) {
        this.createMessage('success', 'activate', data.apikeyReqID);
      } else {
        this.createMessage('error', 'activate');
      }
      
    });
  }

  deactivateAPIKeyStatus(data: any){
    this.partnerStatus = new PartnerStatus(
      //data.partnerStatus,
      this.deactive
    );
    const request = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      this.partnerStatus
    );
    console.log("Request is:"+ request);
    this.dataService.deactivateAPIKey(request , data.partnerID, data.partnerAPIKey).subscribe(dataa =>{

      if (!dataa['errors']) {
        this.createMessage('success', 'activate', data.partnerAPIKey);
      } else {
        this.createMessage('error', 'activate');
      }
      
    });
  }

  activateAPIKeyStatus(data: any){
    this.partnerStatus = new PartnerStatus(
      //data.partnerStatus,
      this.active
    );
    const request = new RequestModel(
      appConstants.registrationCenterCreateId,
      null,
      this.partnerStatus
    );
    console.log("Request is:"+ request);
    this.dataService.deactivateAPIKey(request , data.partnerID, data.partnerAPIKey).subscribe(dataa =>{

      if (!dataa['errors']) {
        this.createMessage('success', 'activate', data.partnerAPIKey);
      } else {
        this.createMessage('error', 'activate');
      }
      
    });
  }

  approveRegistredMisp(data: any, url: string, idKey: string) {    
    if (this.router.url.indexOf('single-view') >= 0) {
      this.auditService.audit(10, 'ADM-085', {
        buttonName: 'decommission',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 3
        ]
      });
    } else {
      this.auditService.audit(9, 'ADM-088', {
        buttonName: 'decommission',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 2
        ]
      });
    }
    this.confirmationPopup('decommission', data.name).afterClosed().subscribe(res => {
      if (res) {
        this.auditService.audit(18, 'ADM-098', 'decommission');
        const mispObject = this.mapDataToObject(data);        
        mispObject.mispStatus ="approved"
        console.log(mispObject);
        this.approveMisp('decommission',mispObject);
      } else {
        this.auditService.audit(19, 'ADM-099', 'decommission');
      }
    });
  }

  activateMisp(data: any, url: string, idKey: string) {
    if (this.router.url.indexOf('single-view') >= 0) {
      this.auditService.audit(10, 'ADM-086', {
        buttonName: 'activate',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 3
        ]
      });
    } else {
      this.auditService.audit(9, 'ADM-089', {
        buttonName: 'activate',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 2
        ]
      });
    }
    this.confirmationPopup('activate', data.name).afterClosed().subscribe(res => {
      if (res) {
        this.auditService.audit(18, 'ADM-100', 'activate');
        const mispObject = this.mapDataToObject(data);
        mispObject.isActive = true;
        mispObject.mispStatus ="Active"
        console.log(mispObject);
        this.updateMisp('activate', mispObject);
      } else {
        this.auditService.audit(19, 'ADM-101', 'activate');
      }
    });
  }

  deactivateMisp(data: any, url: string, idKey: string) {
    if (this.router.url.indexOf('single-view') >= 0) {
      console.log(this.router.url.split('/'));
      this.auditService.audit(10, 'ADM-087', {
        buttonName: 'deactivate',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 3
        ]
      });
    } else {
      this.auditService.audit(9, 'ADM-090', {
        buttonName: 'deactivate',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 2
        ]
      });
    }
    this.confirmationPopup('deactivate', data.name).afterClosed().subscribe(res => {
      if (res) {
        this.auditService.audit(18, 'ADM-102', 'deactivate');
        const mispObject = this.mapDataToObject(data);
        mispObject.isActive = false;
        mispObject.mispStatus = "De-Active";
        console.log(mispObject);
        this.updateMisp('deactivate', mispObject);
      } else {
        this.auditService.audit(19, 'ADM-103', 'deactivate');
      }
    });
  }

  activatePolicy(data: any, url: string, idKey: string) {
    if (this.router.url.indexOf('single-view') >= 0) {
      this.auditService.audit(10, 'ADM-086', {
        buttonName: 'activate',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 3
        ]
      });
    } else {
      this.auditService.audit(9, 'ADM-089', {
        buttonName: 'activate',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 2
        ]
      });
    }
    this.confirmationPopup('activate', data.name).afterClosed().subscribe(res => {
      if (res) {
        this.auditService.audit(18, 'ADM-100', 'activate');
        const policyObject = this.mapDataToPolicyObject(data);
        policyObject.status = 'Active';
        console.log(policyObject);
        this.updatePolicy('activate', policyObject);
      } else {
        this.auditService.audit(19, 'ADM-101', 'activate');
      }
    });
  }

  deactivatePolicy(data: any, url: string, idKey: string) {
    if (this.router.url.indexOf('single-view') >= 0) {
      console.log(this.router.url.split('/'));
      this.auditService.audit(10, 'ADM-087', {
        buttonName: 'deactivate',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 3
        ]
      });
    } else {
      this.auditService.audit(9, 'ADM-090', {
        buttonName: 'deactivate',
        masterdataName: this.router.url.split('/')[
          this.router.url.split('/').length - 2
        ]
      });
    }
    this.confirmationPopup('deactivate', data.name).afterClosed().subscribe(res => {
      if (res) {
        this.auditService.audit(18, 'ADM-102', 'deactivate');
        const policyObject = this.mapDataToPolicyObject(data);
        policyObject.status = 'De-Active';
        console.log(policyObject);
        this.updatePolicy('deactivate', policyObject);
      } else {
        this.auditService.audit(19, 'ADM-103', 'deactivate');
      }
    });
  }

  createAuthPoliciesData(){
    this.authPolicies = [
      {authType: 'otp', authSubType: '', mandatory: true},
      {authType: 'demo', authSubType: '', mandatory: false},
      {authType: 'bio', authSubType: 'FINGER', mandatory: true},
      {authType: 'bio', authSubType: 'IRIS', mandatory: false},
      {authType: 'bio', authSubType: 'FACE', mandatory: false},
      {authType: 'kyc', authSubType: '', mandatory: false}
    ];
  }

  createAllowedKycAttributesData(){
    this.allowedKycAttributes = [
      {attributeName: 'fullName', required:true},
      {attributeName: 'dateOfBirth', required:true},
      {attributeName: 'gender', required:true},
      {attributeName: 'phone', required:true},
      {attributeName: 'email', required:true},
      {attributeName: 'addressLine1', required:true},
      {attributeName: 'addressLine2', required:true},
      {attributeName: 'addressLine3', required:true},
      {attributeName: 'location1', required:true},
      {attributeName: 'location2', required:true},
      {attributeName: 'location3', required:true},
      {attributeName: 'postalCode', required:false},
      {attributeName: 'photo', required:true}
    ];
  }

  createAuthPolicys(data: any){
    this.descr = data.desc;
    this.createAuthPoliciesData();
    console.log("authPolicies is:"+ this.authPolicies);
    this.createAllowedKycAttributesData();
    this.createAuthPolicy = new CreateAuthPolicy(
      data.name,
      this.descr,
      this.authPolicies,
      this.allowedKycAttributes
    );
    const request = new RequestModel(
      appConstants.registrationCreatePartnerId,
      null,
      this.createAuthPolicy
    );
    console.log("Request is:"+ request);
    this.dataService.submitAuthPolicyReq(request , data.id).subscribe(dataa =>{
      console.log("Response: "+ dataa.response);
      if (dataa['errors']) {
        this.createMessage('success', 'activate', dataa.response.name);
      } else {
        //this.createMessage('error', 'activate');
        this.createMessage('success', 'activate', dataa.response.name);
      }
      
    });
  }

}
