import {Component,  ViewEncapsulation} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { BulkuploadService } from 'src/app/core/services/bulkupload.service';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { HeaderService } from 'src/app/core/services/header.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ["./create.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent {
  primaryLang: string;
  uploadForm: FormGroup;
  labelanddatas:any;
  subscribed: any;
  fileNameError:boolean = false;
  constructor(
  private translateService: TranslateService,
  private headerService: HeaderService,
  private bulkuploadService: BulkuploadService,
  private dataStorageService: DataStorageService,
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
    this.primaryLang = this.headerService.getUserPreferredLanguage();

    this.dataStorageService
    .getI18NLanguageFiles(this.primaryLang)
    .subscribe((response) => {
      this.labelanddatas = response["bulkUpload"];
    });
    this.initializeForm();
  }

  initializeForm() {
    this.uploadForm = this.formBuilder.group({
      category : ['masterdata'],
      files: ['', [Validators.required]],
      fileName: ['', [Validators.required]],
      operation: ['', [Validators.required]],
      tableName: ['', [Validators.required]],
    });
  }

  onFileSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.get('files').setValue(file);
      this.uploadForm.get('fileName').setValue(file.name);
      document.getElementById("fileName").classList.remove('addredborder');
      this.fileNameError = false;
    }
  }

  onFileClick(event){
    event.target.value = '';
    this.uploadForm.get('fileName').setValue('');
  }

  submit(){
    if (this.uploadForm.valid) {
      let data = {};
      data = {
        case: 'CONFIRMATION',
        title: "Confirm Bulk Master Data Upload",
        message: "Bulk "+this.uploadForm.get('operation').value+" on "+this.uploadForm.get('tableName').value+" will be processed.\n Please ensure that all information is correct.\n\n\n Transaction will start once you click on confirm.",
        yesBtnTxt: "CONFIRM",
        noBtnTxt: "CANCEL"
      };
      const dialogRef = this.dialog.open(DialogComponent, {
        width: '650px',
        data
      });
      dialogRef.afterClosed().subscribe(response => {   
        if(response){
          this.saveData();
        }      
      });  
    } else {
      for (const i in this.uploadForm.controls) {
        if (this.uploadForm.controls[i]) {
          if(i === "fileName"){
            if(!this.uploadForm.get('fileName').value){
              document.getElementById("fileName").classList.add('addredborder');
              this.fileNameError = true;
            }else{
              console.log("this.uploadForm.get('fileName').value>>>"+this.uploadForm.get('fileName').value);
            }
          }else{
            this.uploadForm.controls[i].markAsTouched();
          }
          
        }
      }
    }  
  }

  saveData(){
    let self = this;
    const formData = new FormData();
    formData.append('files', self.uploadForm.get('files').value);
    formData.append('category', self.uploadForm.get('category').value);
    formData.append('operation', self.uploadForm.get('operation').value);
    formData.append('tableName', self.uploadForm.get('tableName').value);
    self.bulkuploadService.uploadData(formData).subscribe(uploadResponse => {
      self.showMessage(uploadResponse);
    });
  }

  showMessage(uploadResponse){
    let data = {};
    let self = this;
    if(uploadResponse.errors.length == 0){
      let statusDescription : any = JSON.parse(JSON.stringify(uploadResponse.response.statusDescription));
      if(uploadResponse.response.status == "FAILED"){
        for( let prop in statusDescription ){
          console.log( statusDescription[prop] );
        }
        data = {
          case: 'MESSAGE',
          title: "Failure !",
          message: uploadResponse.response.statusDescription,
          btnTxt: "DONE"
        };
      }else{
        data = {
          case: 'MESSAGE',
          title: "Success",
          message: "Your file has been uploaded successfully. \n Data upload is currently in progress.\n\n\n Transaction ID : "+uploadResponse.response.transcationId,
          btnTxt: "DONE"
        };
      }
    }else{
      data = {
        case: 'MESSAGE',
        title: "Failure !",
        message: uploadResponse.errors[0].message,
        btnTxt: "DONE"
      };
    }
    
      
    const dialogRef = self.dialog.open(DialogComponent, {
      width: '550px',
      data
    });
    dialogRef.afterClosed().subscribe(response => {   
      if(uploadResponse.response.status == "FAILED"){
      }else{
        self.location.back();
      }     
    });
  }
  cancel() {
    this.location.back();
  }
}
