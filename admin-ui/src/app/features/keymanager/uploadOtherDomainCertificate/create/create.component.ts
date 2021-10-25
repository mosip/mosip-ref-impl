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
  applicationId = [{id:"PRE_REGISTRATION", value:"PRE_REGISTRATION  3years"}, {id:"REGISTRATION_PROCESSOR", value:"REGISTRATION_PROCESSOR  3years"}, {id:"REGISTRATION", value:"REGISTRATION  3years"}, {id:"IDA", value:"IDA  3years"}, {id:"ID_REPO", value:"ID_REPO  3years"}, {id:"KERNEL", value:"KERNEL  3years"}, {id:"ROOT", value:"ROOT  5years"}, {id:"PMS", value:"PMS  3years"}];
  subscribed: any;
  fileName = "";
  fileData : any;
  buttonalignment = 'ltr';
  primaryLang = "";
  fileNameError:boolean = false;
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
    this.primaryLang = this.headerService.getUserPreferredLanguage();
    this.translateService
    .getTranslation(this.primaryLang)
    .subscribe(response => {
      this.serverError = response.serverError;
      this.popupMessages = response.bulkUpload.popupMessages;
    });    
    if(this.primaryLang === "ara"){
      this.buttonalignment = 'rtl';
    }
    this.initializeForm();
  }

  initializeForm() {
    this.createForm = this.formBuilder.group({
      applicationId : ['', [Validators.required]],
      referenceId: ['', [Validators.required]],
      files: ['', [Validators.required]],
      fileName: ['', [Validators.required]],
    });
  }

  onFileSelect(event) {
    let self = this;
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.createForm.get('files').setValue(file);
      const fileReader: FileReader = new FileReader();
      fileReader.onload = (event: Event) => {
        self.fileData = fileReader.result; // This is valid
      };
      fileReader.readAsText(file);
      this.createForm.get('fileName').setValue(file.name);
      document.getElementById("fileName").classList.remove('addredborder');
      this.fileNameError = false;
    }
  }

  submit(){
    this.saveData();
  }

  saveData(){
    if (this.createForm.valid) {
      let self = this;
      const formData = {};
      formData['applicationId'] = self.createForm.get('applicationId').value.trim();
      formData['referenceId'] = self.createForm.get('referenceId').value.trim();
      formData['certificateData'] = self.fileData.replaceAll("\\n", "\n");
      const primaryRequest = new RequestModel(
        "",
        null,
        formData
      );
      self.keymanagerService.uploadOtherDomainCertificate(primaryRequest).subscribe(response => {
        self.showMessage(response);
      });
    } else {
      for (const i in this.createForm.controls) {
        if (this.createForm.controls[i]) {
          if(i === "fileName"){
            if(!this.createForm.get('fileName').value){
              document.getElementById("fileName").classList.add('addredborder');
              this.fileNameError = true;
            }else{
              console.log("this.uploadForm.get('fileName').value>>>"+this.createForm.get('fileName').value);
            }
          }else{
            this.createForm.controls[i].markAsTouched();
          }
          
        }
      }
    }
  }

  showMessage(response){
    let data = {};
    let self = this;
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
      data = {
        case: 'MESSAGE',
        title: this.popupMessages.popup3.title,
        message: response.response.status,
        btnTxt: this.popupMessages.popup3.btnTxt
      };
    }
    console.log();  
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
