import {Component,  ViewEncapsulation} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { BulkuploadService } from 'src/app/core/services/bulkupload.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { HeaderService } from 'src/app/core/services/header.service';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent {

  uploadForm: FormGroup;
  dropDownValues = ['Insert', 'Update', 'Delete'];
  primaryLangCode;
  // tslint:disable-next-line:max-line-length
  tableNames = [{ id: 'applicant_valid_document', value: 'ApplicantValidDocument'}, { id: 'appl_form_type', value: 'Application'}, { id: 'biometric_attribute', value: 'BiometricAttribute'}, { id: 'biometric_type', value: 'BiometricType'}, { id: 'blacklisted_words', value: 'BlacklistedWords'}, { id: 'daysofweek_list', value: 'DaysOfWeek'}, { id: 'device_master', value: 'Device'}, { id: 'registered_device_master', value: 'DeviceRegister'}, { id: 'device_spec', value: 'DeviceSpecification'}, { id: 'device_type', value: 'DeviceType'}, { id: 'doc_category', value: 'DocumentCategory'}, { id: 'doc_type', value: 'DocumentType'}, { id: 'dynamic_field', value: 'DynamicField'}, { id: 'reg_exceptional_holiday', value: 'ExceptionalHoliday'}, { id: 'foundational_trust_provider', value: 'FoundationalTrustProvider'},  { id: 'gender', value: 'Gender'}, { id: 'loc_holiday', value: 'Holiday'}, { id: 'identity_schema', value: 'IdentitySchema'}, { id: 'id_type', value: 'IdType'}, { id: 'individual_type', value: 'IndividualType'}, { id: 'language', value: 'Language'}, { id: 'location', value: 'Location'}, { id: 'loc_hierarchy_list', value: 'LocationHierarchy'}, { id: 'machine_master', value: 'Machine'}, { id: 'machine_spec', value: 'MachineSpecification'}, { id: 'machine_type', value: 'MachineType'}, { id: 'module_detail', value: 'ModuleDetail'}, { id: 'mosip_device_service', value: 'MOSIPDeviceService'}, { id: 'reason_category', value: 'ReasonCategory'}, { id: 'reason_list', value: 'ReasonList'}, { id: 'reg_exceptional_holiday', value: 'RegExceptionalHoliday'}, { id: 'registered_device_master', value: 'RegisteredDevice'}, { id: 'registration_center', value: 'RegistrationCenter'}, { id: 'reg_center_device', value: 'RegistrationCenterDevice'}, { id: 'reg_center_machine', value: 'RegistrationCenterMachine'}, { id: 'reg_center_machine_device', value: 'RegistrationCenterMachineDevice'}, { id: 'reg_center_type', value: 'RegistrationCenterType'}, { id: 'reg_center_user', value: 'RegistrationCenterUser'}, { id: 'reg_center_user_machine', value: 'RegistrationCenterUserMachine'}, { id: 'reg_device_sub_type', value: 'RegistrationDeviceSubType'}, { id: 'reg_device_type', value: 'RegistrationDeviceType'}, { id: 'reg_working_nonworking', value: 'RegWorkingNonWorking'}, { id: 'schema_def', value: 'SchemaDefinition'}, { id: 'template', value: 'Template'}, { id: 'template_file_format', value: 'TemplateFileFormat'}, { id: 'template_type', value: 'TemplateType'}, { id: 'title', value: 'Title'}, { id: 'user_detail', value: 'UserDetails'}, { id: 'valid_document', value: 'ValidDocument'}, { id: 'zone', value: 'Zone'}, { id: 'zone_user', value: 'ZoneUser'}];
  subscribed: any;
  fileName = '';
  fileCount = 0;
  popUpMessages;
  fileNameError:boolean = false;
  buttonalignment = 'ltr';
  serverError:any;
  constructor(
  private bulkuploadService: BulkuploadService,
  private location: Location,
  private formBuilder: FormBuilder,
  private router: Router,
  private dialog: MatDialog,
  private headerService: HeaderService,
  private translateService: TranslateService,
  private dataService: DataStorageService
  ) {
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });
    this.primaryLangCode =  this.headerService.getUserPreferredLanguage();
    this.translateService.use(this.headerService.getUserPreferredLanguage());
  }

  initializeComponent() {
    this.initializeForm();
    if(this.primaryLangCode === "ara"){
      this.buttonalignment = 'rtl';
    }
    this.dataService
         .getI18NLanguageFiles(this.primaryLangCode)
         .subscribe((response) => {
           this.popUpMessages = response['packet-upload']['createView']['popupMessaages'];
           this.serverError = response['serverError'];
         });
  }

  initializeForm() {
    this.uploadForm = this.formBuilder.group({
      category : ['packet'],
      files: ['', [Validators.required]],
      fileName: ['', [Validators.required]]
    });
  }

  onFileSelect(event) {
    if (event.target.files.length > 0) {
      const files = [].slice.call(event.target.files);
      this.uploadForm.get('files').setValue(files);
      this.fileName = files.map(f => f.name).join(', ');
      this.uploadForm.get('fileName').setValue(this.fileName);
      this.fileCount = event.target.files.length;
      document.getElementById("fileName").classList.remove('addredborder');
      this.fileNameError = false;
    }
  }

  onFileClick(event) {
    event.target.value = '';
    this.fileName = '';
    this.fileCount =  0;
  }

  submit() {
    if (this.uploadForm.valid) {
      let data = {};
      data = {
        case: 'CONFIRMATION',
        title: this.popUpMessages.popup1.uploadConfirm,
        message: this.fileCount + this.popUpMessages.popup1.message,
        yesBtnTxt: this.popUpMessages.popup1.confirmBtnTxt,
        noBtnTxt: this.popUpMessages.popup1.cancelBtnTxt
      };
      const dialogRef = this.dialog.open(DialogComponent, {
        width: '650px',
        data
      });
      dialogRef.afterClosed().subscribe(response => {
        if (response) {
          this.saveData();
        }
      });
    } else {
      for (const i in this.uploadForm.controls) {
        if (this.uploadForm.controls[i]) {
          if(i === "fileName"){
            document.getElementById("fileName").classList.add('addredborder');
            this.fileNameError = true;
          }else{
            this.uploadForm.controls[i].markAsTouched();
          }
          
        }
      }
    } 
  }

  saveData() {    
    const self = this;
    const formData = new FormData();
    for (let i = 0; i < this.fileCount; i++) {
      formData.append('files', self.uploadForm.get('files').value[i]);
    }

    formData.append('category', self.uploadForm.get('category').value);
    formData.append('operation', '');
    formData.append('tableName', '');
    self.bulkuploadService.uploadData(formData).subscribe(uploadResponse => {
      self.showMessage(uploadResponse);
    });    
  }

  showMessage(uploadResponse) {
    let data = {};
    const self = this;
    if(uploadResponse.errors.length == 0){
      const statusDescription: any = JSON.parse(JSON.stringify(uploadResponse.response.statusDescription));
      if (uploadResponse.response.status === 'FAILED') {
        // tslint:disable-next-line:forin
        for ( const prop in statusDescription ) {
          console.log( statusDescription[prop] );
        }
        data = {
          case: 'MESSAGE',
          title: this.popUpMessages.popup2.title,
          message: uploadResponse.response.statusDescription,
          btnTxt: this.popUpMessages.popup2.btnTxt,
        };
      } else {
        data = {
          case: 'MESSAGE',
          title: this.popUpMessages.popup3.title,
          message: this.popUpMessages.popup3.message + uploadResponse.response.transcationId,
          btnTxt: this.popUpMessages.popup3.btnTxt,
        };
      }
    }else{
      data = {
        case: 'MESSAGE',
        title: this.popUpMessages.popup2.title,
        message: this.serverError[uploadResponse.errors[0].errorCode],
        btnTxt: this.popUpMessages.popup2.btnTxt
      };
    }

    const dialogRef = self.dialog.open(DialogComponent, {
      width: '550px',
      data
    });
    dialogRef.afterClosed().subscribe(response => {
      if (uploadResponse.response.status === 'FAILED') {
      } else {
        self.location.back();
      }
    });
  }
  cancel() {
    this.location.back();
  }
}
