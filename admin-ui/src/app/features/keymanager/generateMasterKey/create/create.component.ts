import {Component,  ViewEncapsulation} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { KeymanagerService } from 'src/app/core/services/keymanager.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { RequestModel } from 'src/app/core/models/request.model';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ["./create.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent {

  createForm: FormGroup;
  dropDownValues = ["Insert","Update", "Delete"];
  applicationId = [{id:"PRE_REGISTRATION", value:"PRE_REGISTRATION  3years"}, {id:"REGISTRATION_PROCESSOR", value:"REGISTRATION_PROCESSOR  3years"}, {id:"REGISTRATION", value:"REGISTRATION  3years"}, {id:"IDA", value:"IDA  3years"}, {id:"ID_REPO", value:"ID_REPO  3years"}, {id:"KERNEL", value:"KERNEL  3years"}, {id:"ROOT", value:"ROOT  5years"}, {id:"PMS", value:"PMS  3years"}];
  objectType = [{id:"Certificate", value:"Certificate"}, {id:"CSR", value:"CSR"}];
  force = [{id:"true", value:"True"}, {id:"false", value:"False"}];
  subscribed: any;
  fileName = "";

  constructor(
  private keymanagerService: KeymanagerService,
  private location: Location,
  private formBuilder: FormBuilder,
  private router: Router,
  private dialog: MatDialog,
  ) {
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });
  }

  initializeComponent() {
    this.initializeForm();
  }

  initializeForm() {
    this.createForm = this.formBuilder.group({
      applicationId : [''],
      referenceId: [''],
      commonName: [''],
      organization: [''],
      organizationUnit: [''],
      location: [''],
      state: [''],
      country: [''],
      force: [''],
      objectType: [''],
    });
  }

  submit(){
    /*let data = {};
    data = {
      case: 'CONFIRMATION',
      title: "Confirm Bulk Master Data Upload",
      message: "Bulk "+this.createForm.get('operation').value+" on "+this.createForm.get('tableName').value+" will be processed.\n Please ensure that all information is correct.\n\n\n Transaction will start once you click on confirm.",
      yesBtnTxt: "CONFIRM",
      noBtnTxt: "CANCEL"
    };
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px',
      data
    });
    dialogRef.afterClosed().subscribe(response => {   
      if(response){*/
        this.saveData();
      /*}      
    }); */   
  }

  saveData(){
    let self = this;
    const formData = {};
    formData['applicationId'] = self.createForm.get('applicationId').value;
    formData['referenceId'] = self.createForm.get('referenceId').value;
    formData['commonName'] = self.createForm.get('commonName').value;
    formData['organization'] = self.createForm.get('organization').value;
    formData['organizationUnit'] = self.createForm.get('organizationUnit').value;
    formData['location'] = self.createForm.get('location').value;
    formData['state'] = self.createForm.get('state').value;
    formData['country'] = self.createForm.get('country').value;
    formData['force'] = self.createForm.get('force').value;
    const primaryRequest = new RequestModel(
      "",
      null,
      formData
    );
    self.keymanagerService.generateMasterkey(primaryRequest, self.createForm.get('objectType').value).subscribe(response => {
      self.showMessage(response);
    });
  }

  showMessage(response){
    let data = {};
    let self = this;
    let displaycert = "";
    if(response.response.status == "FAILED"){
      data = {
        case: 'MESSAGE',
        title: "Failure !",
        message: "Please retry again.",
        btnTxt: "DONE"
      };
    }else{
      if(response.response.certificate){
        displaycert = response.response.certificate;
      }else if(response.response.certSignRequest){
        displaycert = response.response.certSignRequest;
      }
      data = {
        case: 'MESSAGE',
        title: "Success",
        message: displaycert,
        btnTxt: "DONE"
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
