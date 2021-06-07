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
  subscribed: any;
  fileName = "";
  fileData:any;

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
      files: [''],
    });
  }

  onFileSelect(event) {
    let self = this;
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      self.createForm.get('files').setValue(file);
      self.fileName = file.name;

      const fileReader: FileReader = new FileReader();

      fileReader.onload = (event: Event) => {
        self.fileData = fileReader.result; // This is valid
      };

      fileReader.readAsText(file);

      /*var reader = new FileReader();
      reader.onload = function(evt) {
        if(evt.target.readyState != 2) return;
        if(evt.target.error) {
            alert('Error while reading file');
            return;
        }
        self.fileData = evt.target.result;
      };
      reader.readAsText(file);*/
    }
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
    console.log("self.fileData>>>"+self.fileData);
    const formData = {};
    formData['applicationId'] = self.createForm.get('applicationId').value;
    formData['referenceId'] = self.createForm.get('referenceId').value;
    formData['certificateData'] = self.fileData.replaceAll("\\n", "\n");
    const primaryRequest = new RequestModel(
      "",
      null,
      formData
    );
    self.keymanagerService.uploadCertificate(primaryRequest).subscribe(response => {
      self.showMessage(response);
    });
  }

  showMessage(response){
    let data = {};
    let self = this;
    if(response.errors){
      data = {
        case: 'MESSAGE',
        title: "Failure !",
        message: response.errors[0].message,
        btnTxt: "DONE"
      };
    }else{
      data = {
        case: 'MESSAGE',
        title: "Success",
        message: response.response.status,
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
