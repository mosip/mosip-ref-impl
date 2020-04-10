import {
  Component,
  OnInit,
  ElementRef,
  ViewChildren, 
  Input
} from '@angular/core';

import { Router } from '@angular/router';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { RequestModel } from 'src/app/core/models/request.model';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import {
  MatKeyboardRef,
  MatKeyboardComponent
} from 'ngx7-material-keyboard';

import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';

import { CenterDropdown } from 'src/app/core/models/center-dropdown';
import { FilterRequest } from 'src/app/core/models/filter-request.model';
import { FilterValuesModel } from 'src/app/core/models/filter-values.model';

@Component({
  selector: 'app-mater-data-common-body',
  templateUrl: './mater-data-common-body.component.html'
})
export class MaterDataCommonBodyComponent implements OnInit {
  private keyboardRef: MatKeyboardRef<MatKeyboardComponent>;
  @ViewChildren('keyboardRef', { read: ElementRef })
  private attachToElementMesOne: any;
  selectedField: HTMLElement;
  primaryForm: FormGroup;
  secondaryForm: FormGroup;
  popupMessages: any;
  pageName: string;
  disableForms: boolean;

  @Input() primaryData: any;
  @Input() secondaryData: any;
  @Input() fields: any;

  @Input() primaryLang: string;
  @Input() secondaryLang: string;
  @Input() masterdataType: any;

  dropDownValues = new CenterDropdown();

  languageNames = {
    ara: 'عربى',
    fra: 'French',
    eng: 'English'
  };
  showSecondaryForm: boolean;
  isCreateForm:boolean;

  constructor(
    private dataStorageService: DataStorageService,
    private router: Router,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,  
  ) { }

  ngOnInit() {
    this.primaryLang === this.secondaryLang ? this.showSecondaryForm = false : this.showSecondaryForm = true;
    this.isCreateForm = false;
    this.disableForms = false;
    let url = this.router.url.split('/')[3];
    if(!this.primaryData){
      this.isCreateForm = true;
      if(url === "center-type"){
        this.pageName = "Center Type";
        this.primaryData = {"code":"","name":"","descr":"","langCode":this.primaryLang,"isActive":true};
      }else if(url === "blacklisted-words"){
        this.pageName = "Blacklisted Word";
        this.primaryData = {"word":"","description":"","langCode":this.primaryLang,"isActive":true};
      }else if(url === "gender-type"){
        this.pageName = "Gender Type";
        this.primaryData = {"code":"","genderName":"","langCode":this.primaryLang,"isActive":true};
      }else if(url === "individual-type"){
        this.pageName = "Individual Type";
        this.primaryData = {"code":"","name":"","langCode":this.primaryLang,"isActive":true};
      }else if(url === "location"){
        this.pageName = "Location";
        this.primaryData = {"region":"","province":"","city":"","zone":"","postalCode":"","langCode":this.primaryLang,"isActive":true};
      }else if(url === "templates"){
        this.pageName = "Template";
        this.getTemplateFileFormat();
        this.primaryData = {"name":"","description":"","fileFormatCode":"","model":"","fileText":"","moduleId":"","moduleName":"","templateTypeCode":"","langCode":this.primaryLang,"isActive":true,id:"0"};;
      }else if(url === "title"){
        this.pageName = "Title";
        this.primaryData = {"code":"","titleName":"","titleDescription":"","langCode":this.primaryLang,"isActive":true};
      }else if(url === "device-specs"){
        this.pageName = "Device Specification";
        this.getDeviceTypes();
        this.primaryData = {"name":"","brand":"","model":"","deviceTypeCode":"","minDriverversion":"","description":"","langCode":this.primaryLang,"isActive":true,"id":"0"};
      }else if(url === "device-types"){
        this.pageName = "Device Type";
        this.primaryData = {"code":"","name":"","description":"","langCode":this.primaryLang,"isActive":true};
      }else if(url === "machine-specs"){
        this.pageName = "Machine Specification";
        this.getMachineTypes();
        this.primaryData = {"name":"","brand":"","model":"","machineTypeCode":"","minDriverversion":"","description":"","langCode":this.primaryLang,"isActive":true,"id":"0"};
      }else if(url === "machine-type"){
        this.pageName = "Machine Type";
        this.primaryData = {"code":"","name":"","description":"","langCode":this.primaryLang,"isActive":true};
      }else if(url === "document-type"){
        this.pageName = "Document Type";
        this.primaryData = {"code":"","name":"","description":"","langCode":this.primaryLang,"isActive":true};
      }else if(url === "document-categories"){
        this.pageName = "Document Category";
        this.primaryData = {"code":"","name":"","description":"","langCode":this.primaryLang,"isActive":true};
      }else if(url === "holiday"){
        this.pageName = "Holiday";
        this.primaryData = {"holidayName":"","holidayDesc":"","holidayDate":"","locationCode": "", "holidayMonth":null,"holidayYear":null,"holidayDay":null,"langCode":this.primaryLang,"isActive":true,"id":"0"};
      }
    }else{
      if(url === "center-type"){
        this.pageName = "Center Type";
      }else if(url === "blacklisted-words"){
        this.pageName = "Blacklisted Word";
      }else if(url === "gender-type"){
        this.pageName = "Gender Type";
      }else if(url === "individual-type"){
        this.pageName = "Individual Type";
      }else if(url === "location"){
        this.pageName = "Location";
      }else if(url === "templates"){
        this.pageName = "Template";
        this.getTemplateFileFormat();
      }else if(url === "title"){
        this.pageName = "Title";
      }else if(url === "device-specs"){
        this.pageName = "Device Specification";
        this.getDeviceTypes();
      }else if(url === "device-types"){
        this.pageName = "Device Type";
      }else if(url === "machine-specs"){
        this.pageName = "Machine Specification";
        this.getMachineTypes();
      }else if(url === "machine-type"){
        this.pageName = "Machine Type";
      }else if(url === "document-type"){
        this.pageName = "Document Type";
      }else if(url === "document-categories"){
        this.pageName = "Document Category";
      }else if(url === "holiday"){
        this.pageName = "Holiday";
      }
    }

    if(!this.secondaryData){
      if(url === "center-type"){
        this.secondaryData = {"code":"","name":"","descr":"","langCode":this.secondaryLang,"isActive":true};
      }else if(url === "blacklisted-words"){
        this.secondaryData = {"word":"","description":"","langCode":this.secondaryLang,"isActive":true};
      }else if(url === "gender-type"){
        this.secondaryData = {"code":"","genderName":"","langCode":this.secondaryLang,"isActive":true};
      }else if(url === "individual-type"){
        this.secondaryData = {"code":"","name":"","langCode":this.secondaryLang,"isActive":true};
      }else if(url === "location"){
        this.secondaryData = {"region":"","province":"","city":"","zone":"","postalCode":"","langCode":this.secondaryLang,"isActive":true};
      }else if(url === "templates"){
        this.secondaryData = {"name":"","description":"","fileFormatCode":"","model":"","fileText":"","moduleId":"","moduleName":"","templateTypeCode":"","langCode":this.secondaryLang,"isActive":true,id:"0"};
      }else if(url === "title"){
        this.secondaryData = {"code":"","titleName":"","titleDescription":"","langCode":this.secondaryLang,"isActive":true};
      }else if(url === "device-specs"){
        this.secondaryData = {"name":"","brand":"","model":"","deviceTypeCode":"","minDriverversion":"","description":"","langCode":this.secondaryLang,"isActive":true,"id":"0"};
      }else if(url === "device-types"){
        this.secondaryData = {"code":"","name":"","description":"","langCode":this.secondaryLang,"isActive":true};
      }else if(url === "machine-specs"){
        this.secondaryData = {"name":"","brand":"","model":"","machineTypeCode":"","minDriverversion":"","description":"","langCode":this.secondaryLang,"isActive":true,"id":"0"};
      }else if(url === "machine-type"){
        this.secondaryData = {"code":"","name":"","description":"","langCode":this.secondaryLang,"isActive":true};
      }else if(url === "document-type"){
        this.secondaryData = {"code":"","name":"","description":"","langCode":this.secondaryLang,"isActive":true};
      }else if(url === "document-categories"){
        this.secondaryData = {"code":"","name":"","description":"","langCode":this.secondaryLang,"isActive":true};
      }else if(url === "holiday"){
        this.secondaryData = {"holidayName":"","holidayDesc":"","holidayDate":"","locationCode": "","holidayMonth":null,"holidayYear":null,"holidayDay":null,"langCode":this.secondaryLang,"isActive":true,"id":"0"};
      }
    }
  }

  getDeviceTypes() {
    const filterObject = new FilterValuesModel('name', 'unique', '');
    let filterRequest = new FilterRequest([filterObject], this.primaryLang);
    let request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('devicetypes', request)
      .subscribe(response => {
        this.dropDownValues.deviceTypeCode.primary = response.response.filters;
      });
    filterRequest = new FilterRequest([filterObject], this.secondaryLang);
    request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('devicetypes', request)
      .subscribe(response => {
        this.dropDownValues.deviceTypeCode.secondary =
          response.response.filters;
      });
  }

  getTemplateFileFormat() {
    this.dataStorageService
      .getDropDownValuesForMasterData('templatefileformats/'+this.primaryLang)
      .subscribe(response => {
        this.dropDownValues.fileFormatCode.primary = response.response.templateFileFormats;
      });
    this.dataStorageService
      .getDropDownValuesForMasterData('templatefileformats/'+this.secondaryLang)
      .subscribe(response => {
        this.dropDownValues.fileFormatCode.secondary = response.response.templateFileFormats;
      });
    this.dataStorageService
      .getDropDownValuesForMasterData('templatetypes/'+this.primaryLang)
      .subscribe(response => {
        this.dropDownValues.templateTypeCode.primary = response.response.templateTypes;
      });
    this.dataStorageService
      .getDropDownValuesForMasterData('templatetypes/'+this.secondaryLang)
      .subscribe(response => {
        this.dropDownValues.templateTypeCode.secondary = response.response.templateTypes;
      });
    this.dataStorageService
      .getDropDownValuesForMasterData('modules/'+this.primaryLang)
      .subscribe(response => {
        this.dropDownValues.moduleId.primary = response.response.modules;
      });
    this.dataStorageService
      .getDropDownValuesForMasterData('modules/'+this.secondaryLang)
      .subscribe(response => {
        this.dropDownValues.moduleId.secondary = response.response.modules;
      });
  }

  getMachineTypes() {
    const filterObject = new FilterValuesModel('name', 'unique', '');
    let filterRequest = new FilterRequest([filterObject], this.primaryLang);
    let request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('machinetypes', request)
      .subscribe(response => {
        this.dropDownValues.machineTypeCode.primary = response.response.filters;
      });
    filterRequest = new FilterRequest([filterObject], this.secondaryLang);
    request = new RequestModel('', null, filterRequest);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes('machinetypes', request)
      .subscribe(response => {
        this.dropDownValues.machineTypeCode.secondary =
          response.response.filters;
      });
  }

  changePage(location: string) {
    if (location === 'home') {
      this.router.navigateByUrl('admin/masterdata/home');
    } else if (location === 'list') {
      this.router.navigateByUrl(
        `admin/masterdata/${this.masterdataType}/view`
      );
    }
  }

  captureValue(event: any, formControlName: string, type: string) {
    if (type === 'primary') {
      this.primaryData[formControlName] = event.target.value;
    } else if (type === 'secondary') {
      this.secondaryData[formControlName] = event.target.value;
    }
  }

  captureDatePickerValue(event: any, formControlName: string, type: string) {
    let dateFormat = new Date(event.target.value);
    let formattedDate = dateFormat.getFullYear() + "-" + ("0"+(dateFormat.getMonth()+1)).slice(-2) + "-" + ("0" + dateFormat.getDate()).slice(-2);
    this.primaryData[formControlName] = formattedDate;
    this.secondaryData[formControlName] = formattedDate;
  }
  
  captureDropDownValue(event: any, formControlName: string, type: string) {
    if (event.source.value && event.source.selected) {
      this.primaryData[formControlName] = event.source.value;
      this.secondaryData[formControlName] = event.source.value;
    }
  }

  submit() {

      if(this.isCreateForm){
        let request = new RequestModel(
          "",
          null,
          this.primaryData
        );
        this.dataStorageService.createMasterData(request).subscribe(updateResponse => {
            if (!updateResponse.errors) {
              let request = new RequestModel(
                "",
                null,
                this.secondaryData
              );
              this.dataStorageService.createMasterData(request).subscribe(updateResponse => {
                  if (!updateResponse.errors) {
                    let url = this.pageName+" Created Successfully";
                    this.showMessage(url)
                      .afterClosed()
                      .subscribe(() => {
                        this.router.navigateByUrl(
                          `admin/masterdata/${this.masterdataType}/view`
                        );
                      });
                  } else {
                    this.showErrorPopup(updateResponse.errors[0].message);
                  }
              });
            } else {
              this.showErrorPopup(updateResponse.errors[0].message);
            }
        });
      }else{
        if(this.primaryData){
          delete this.primaryData['createdBy'];
          delete this.primaryData['createdDateTime'];
          delete this.primaryData['updatedBy'];
          delete this.primaryData['updatedDateTime'];
          delete this.primaryData['isDeleted'];
          delete this.primaryData['deletedDateTime'];
          delete this.primaryData['deviceTypeName']; 
        }
        if(this.secondaryData){
          delete this.secondaryData['createdBy'];
          delete this.secondaryData['createdDateTime'];
          delete this.secondaryData['updatedBy'];
          delete this.secondaryData['updatedDateTime'];
          delete this.secondaryData['isDeleted'];
          delete this.secondaryData['deletedDateTime'];
          delete this.secondaryData['deviceTypeName']; 
        }
        let request = new RequestModel(
          "",
          null,
          this.primaryData
        );
        this.dataStorageService.updateData(request).subscribe(updateResponse => {
            if (!updateResponse.errors) {
              let request = new RequestModel(
                "",
                null,
                this.secondaryData
              );
              this.dataStorageService.updateData(request).subscribe(updateResponse => {
                  if (!updateResponse.errors) {
                    let url = this.pageName+" Updated Successfully";
                    this.showMessage(url)
                      .afterClosed()
                      .subscribe(() => {
                        this.router.navigateByUrl(
                          `admin/masterdata/${this.masterdataType}/view`
                        );
                      });
                  } else {
                    this.showErrorPopup(updateResponse.errors[0].message);
                  }
              });
            } else {
              this.showErrorPopup(updateResponse.errors[0].message);
            }
        });
      }
    
  }

  markFormTouched(group: FormGroup | FormArray) {
    Object.keys(group.controls).forEach((key: string) => {
      const control = group.controls[key];
      if (control instanceof FormGroup || control instanceof FormArray) { control.markAsTouched(); this.markFormTouched(control); }
      else { control.markAsTouched(); };
    });
  };

  showMessage(message: string) {
    console.log();
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        case: 'MESSAGE',
        title: 'Success',
        message: message,
        btnTxt: 'Ok'
      }
    });
    return dialogRef;
  }

  showErrorPopup(message: string) {
    this.dialog
      .open(DialogComponent, {
        width: '350px',
        data: {
          case: 'MESSAGE',
          title: 'Error',
          message: message,
          btnTxt: 'Ok'
        },
        disableClose: true
      });
  }
}