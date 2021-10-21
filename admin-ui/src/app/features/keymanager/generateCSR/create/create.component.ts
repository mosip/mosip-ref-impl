import {Component,  ViewEncapsulation} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { KeymanagerService } from 'src/app/core/services/keymanager.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { RequestModel } from 'src/app/core/models/request.model';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from "src/app/core/services/header.service";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ["./create.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent {

  createForm: FormGroup;
  dropDownValues = ["Insert","Update", "Delete"];
  applicationId = [{id:"PRE_REGISTRATION", value:"PRE_REGISTRATION  3years"}, {id:"REGISTRATION_PROCESSOR", value:"REGISTRATION_PROCESSOR  3years"}, {id:"REGISTRATION", value:"REGISTRATION  3years"}, {id:"IDA", value:"IDA  3years"}, {id:"ID_REPO", value:"ID_REPO  3years"}, {id:"KERNEL", value:"KERNEL  3years"}, {id:"ROOT", value:"ROOT  5years"}, {id:"PMS", value:"PMS  3years"}, {id:"ADMIN_SERVICES", value:"ADMIN_SERVICES  3years"}, {id:"RESIDENT", value:"RESIDENT  3years"}];
  subscribed: any;
  fileName = "";
  serverError:any;
  popupMessages:any;
  constructor(
  private keymanagerService: KeymanagerService,
  private location: Location,
  private formBuilder: FormBuilder,
  private router: Router,
  private dialog: MatDialog,
  private translateService: TranslateService,
  private headerService: HeaderService
  ) {
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });
  }

  initializeComponent() {
    this.translateService.use(this.headerService.getUserPreferredLanguage());
    this.translateService.getTranslation(this.headerService.getUserPreferredLanguage()).subscribe(response => {
      this.applicationId = response.keymanager.applicationIds;
      this.serverError = response.serverError;
      this.popupMessages = response.bulkUpload.popupMessages;
    });
    this.initializeForm();
  }

  initializeForm() {
    this.createForm = this.formBuilder.group({
      applicationId : ['', [Validators.required]],
      referenceId: [''],
      commonName: [''],
      organization: [''],
      organizationUnit: [''],
      location: [''],
      state: [''],
      country: [''],
    });
  }

  submit(){
    if (this.createForm.valid) {
      this.saveData();
    } else {
      for (const i in this.createForm.controls) {
        if (this.createForm.controls[i]) {
          this.createForm.controls[i].markAsTouched();
        }
      }
    }
  }

  saveData(){
    let self = this;
    const formData = {};
    formData['applicationId'] = self.createForm.get('applicationId').value.trim();
    formData['referenceId'] = self.createForm.get('referenceId').value.trim();
    formData['commonName'] = self.createForm.get('commonName').value.trim();
    formData['organization'] = self.createForm.get('organization').value.trim();
    formData['organizationUnit'] = self.createForm.get('organizationUnit').value.trim();
    formData['location'] = self.createForm.get('location').value.trim();
    formData['state'] = self.createForm.get('state').value.trim();
    formData['country'] = self.createForm.get('country').value.trim();
    const primaryRequest = new RequestModel(
      "",
      null,
      formData
    );
    self.keymanagerService.generateCSR(primaryRequest).subscribe(response => {
      self.showMessage(response);
    });
  }

  showMessage(response){
    let data = {};
    let self = this;
    let displaycert = "";
    if(response.errors){
      let message = "";
      if(response.errors[0].errorCode === "KER-MSD-999"){
        response.errors.forEach((element) => {
          message = message + element.message.toString() +"\n\n";
        });
        message = this.serverError[response.errors[0].errorCode] +"\n\n"+ message;
      }else{
        message = this.serverError[response.errors[0].errorCode];
      }
      data = {
        case: 'MESSAGE',
        title: this.popupMessages.popup2.title,
        message: message,
        btnTxt: this.popupMessages.popup2.btnTxt
      };
    }else{      
      if(response.response.certificate){
        displaycert = response.response.certificate;
      }else if(response.response.certSignRequest){
        displaycert = response.response.certSignRequest;
      }
      data = {
        case: 'MESSAGE',
        title: this.popupMessages.popup3.title,
        message: displaycert,
        btnTxt: this.popupMessages.popup3.btnTxt
      };
    }
    const dialogRef = self.dialog.open(DialogComponent, {
      width: '650px',
      data
    });
    dialogRef.afterClosed().subscribe(response => {   
      if(response.errors){
      }else{
        location.reload();
      }     
    });
  }

  cancel() {
    location.reload();
  }
}
