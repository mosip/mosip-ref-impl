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
import { FormGroup, FormBuilder } from '@angular/forms';

import {
  MatKeyboardRef,
  MatKeyboardComponent,
  MatKeyboardService
} from 'ngx7-material-keyboard';

import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';
import { CenterDropdown } from 'src/app/core/models/center-dropdown';
import { FilterRequest } from 'src/app/core/models/filter-request.model';
import { FilterValuesModel } from 'src/app/core/models/filter-values.model';
import * as appConstants from '../../../../app.constants';

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
  copyPrimaryWord: any;
  copySecondaryWord: any;

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

  primaryKeyboard: string;
  secondaryKeyboard: string;
  keyboardType: string;

  constructor(
    private dataStorageService: DataStorageService,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private keyboardService: MatKeyboardService,
  ) { }

  ngOnInit() {
    this.primaryLang === this.secondaryLang ? this.showSecondaryForm = false : this.showSecondaryForm = true;
    this.isCreateForm = false;
    this.disableForms = false;
    this.primaryKeyboard = appConstants.keyboardMapping[this.primaryLang];
    this.secondaryKeyboard = appConstants.keyboardMapping[this.secondaryLang];
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
        this.getHierarchyLevel();
        this.primaryData = {"code":"","name":"","hierarchyLevel":"","hierarchyName":"","parentLocCode":"","langCode":this.primaryLang,"isActive":true};
      }else if(url === "templates"){
        this.pageName = "Template";
        this.getTemplateFileFormat();
        this.primaryData = {"name":"","description":"","fileFormatCode":"","model":"","fileText":"","moduleId":"","moduleName":"","templateTypeCode":"","langCode":this.primaryLang,"isActive":true,id:"0"};
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
        this.primaryData = {"holidayName":"","holidayDesc":"","holidayDate":"","locationCode": "","langCode":this.primaryLang,"isActive":true};
      }
    }else{
      
      if(url === "center-type"){
        this.pageName = "Center Type";
      }else if(url === "blacklisted-words"){
        this.copyPrimaryWord = this.primaryData.word;
        if(this.secondaryData){
          this.copySecondaryWord = this.secondaryData.word;
        }        
        this.pageName = "Blacklisted Word";
        this.primaryData['oldWord'] = this.primaryData['word'];
      }else if(url === "gender-type"){
        this.pageName = "Gender Type";
      }else if(url === "individual-type"){
        this.pageName = "Individual Type";
      }else if(url === "location"){
        this.pageName = "Location";
        this.getHierarchyLevel();
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
        this.secondaryData = {"code":"","name":"","hierarchyLevel":"","hierarchyName":"","parentLocCode":"","langCode":this.secondaryLang,"isActive":true};
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
        this.secondaryData = {"holidayName":"","holidayDesc":"","holidayDate":"","locationCode": "","langCode":this.secondaryLang,"isActive":true};
      }
    }
  }

  scrollPage(
    element: HTMLElement,
    type: string,
    formControlName: string,
    index: number
  ) {
    //element.scrollIntoView({ block: 'center', inline: 'nearest' });
    this.selectedField = element;
    if (this.keyboardRef) {
      this.keyboardRef.instance.setInputInstance(
        this.attachToElementMesOne._results[index]
      );
      /*if (type === 'primary') {
        this.keyboardRef.instance.attachControl(
          this.primaryForm.controls[formControlName]
        );
      } else if (type === 'secondary') {
        this.keyboardRef.instance.attachControl(
          this.secondaryForm.controls[formControlName]
        );
      }*/
    }
  }

  openKeyboard(type: string) {
    if (this.keyboardService.isOpened && this.keyboardType === type) {
      this.keyboardService.dismiss();
      this.keyboardRef = undefined;
    } else {
      this.keyboardType = type;
      if (type === 'primary') {
        this.keyboardRef = this.keyboardService.open(this.primaryKeyboard);
      } else if (type === 'secondary') {
        this.keyboardRef = this.keyboardService.open(this.secondaryKeyboard);
      }
      if (this.selectedField) {
        this.selectedField.focus();
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

  getHierarchyLevel() {
    this.dataStorageService
      .getDropDownValuesForMasterData('locations/'+this.primaryLang)
      .subscribe(response => {
        this.dropDownValues.hierarchyLevelCode.primary = response.response.locations.sort((a, b) => { return a.locationHierarchylevel - b.locationHierarchylevel;});
      });
    this.dataStorageService
      .getDropDownValuesForMasterData('locations/'+this.secondaryLang)
      .subscribe(response => {
        this.dropDownValues.hierarchyLevelCode.secondary = response.response.locations.sort((a, b) => { return a.locationHierarchylevel - b.locationHierarchylevel;});
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
    if (type === 'primary') {
      this.primaryData[formControlName] = formattedDate;
    } else if (type === 'secondary') {
      this.secondaryData[formControlName] = formattedDate;
    }
  }

  captureDropDownValue(event: any, formControlName: string, type: string) {
    if (event.source.selected) {
      this.primaryData[formControlName] = event.source.value;
      this.secondaryData[formControlName] = event.source.value; 
    }
  }

  captureLocationDropDownValue(event: any, formControlName: string, type: string) {    
    if (event.source.selected) {
      this.primaryData[formControlName] = event.source.value;
      this.secondaryData[formControlName] = event.source.value; 
      this.primaryData["hierarchyName"] = event.source.viewValue;
    }
  }

  captureLocationSecondaryDropDownValue(event: any, formControlName: string, type: string) {
    if (event.source.value) {
      this.secondaryData["hierarchyName"] = event.source.viewValue; 
    }
  }

  submit() {
    let self = this;
    self.executeAPI();
/*    for (var i = 0, len = self.fields.length; i < len; i++) {
      if (self.fields[i].showInSingleView) {
        if(self.fields[i].ismandatory){
          if(!self.primaryData[self.fields[i].name]){
            this.showErrorPopup(self.fields[i].label[this.primaryLang]+" is required");
            break;
          }else if(len = i+1){
            self.executeAPI();
          }
        }
      }
    }*/
  }

  executeAPI(){
    let url = this.router.url.split('/')[3];
    let textToValidate = null;
    if(url === "center-type"){
      textToValidate = this.secondaryData.name;
    }else if(url === "blacklisted-words"){
      textToValidate = this.secondaryData.word;
    }else if(url === "gender-type"){
      textToValidate = this.secondaryData.genderName;
    }else if(url === "individual-type"){
      textToValidate = this.secondaryData.name;
    }else if(url === "location"){
      textToValidate = this.secondaryData.zone;
    }else if(url === "templates"){
      textToValidate = this.secondaryData.name;
    }else if(url === "title"){
      textToValidate = this.secondaryData.titleName;
    }else if(url === "device-specs"){
      textToValidate = this.secondaryData.name;
    }else if(url === "device-types"){
      textToValidate = this.secondaryData.name;
    }else if(url === "machine-specs"){
      textToValidate = this.secondaryData.name;
    }else if(url === "machine-type"){
      textToValidate = this.secondaryData.name;
    }else if(url === "document-type"){
      textToValidate = this.secondaryData.name;
    }else if(url === "document-categories"){
      textToValidate = this.secondaryData.name;
    }else if(url === "holiday"){
      textToValidate = this.secondaryData.holidayName;
    }
    if(this.isCreateForm){
      let request = new RequestModel(
        "",
        null,
        this.primaryData
      );
      this.dataStorageService.createMasterData(request).subscribe(updateResponse => {
          if (!updateResponse.errors) {
            if(textToValidate){
              this.secondaryData["code"] = updateResponse.response.code; 
              if(updateResponse.response.id){
                this.secondaryData["id"] = updateResponse.response.id; 
              }              
              let request = new RequestModel(
                updateResponse.response.code,
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
            }else{
              let url = this.pageName+" Created Successfully";
              this.showMessage(url)
                .afterClosed()
                .subscribe(() => {
                  this.router.navigateByUrl(
                    `admin/masterdata/${this.masterdataType}/view`
                  );
                });
            }
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
        delete this.primaryData['machineTypeName'];        
      }
      if(this.secondaryData){
        delete this.secondaryData['createdBy'];
        delete this.secondaryData['createdDateTime'];
        delete this.secondaryData['updatedBy'];
        delete this.secondaryData['updatedDateTime'];
        delete this.secondaryData['isDeleted'];
        delete this.secondaryData['deletedDateTime'];
        delete this.secondaryData['deviceTypeName'];
        delete this.secondaryData['machineTypeName'];
      }
      if(this.router.url.split('/')[3] === "blacklisted-words"){
        this.primaryData['oldWord'] = this.copyPrimaryWord;
        if(this.secondaryData.word){
          this.secondaryData['oldWord'] = this.copySecondaryWord;
        }         
      }
      if(this.router.url.split('/')[3] === "holiday"){
        delete this.primaryData['name'];
        delete this.secondaryData['name'];
      }
      let request = new RequestModel(
        "",
        null,
        this.primaryData
      );

      this.dataStorageService.updateData(request).subscribe(updateResponse => {
          if (!updateResponse.errors) {
            if(textToValidate){
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
            }else{
              let url = this.pageName+" Updated Successfully";
                this.showMessage(url)
                  .afterClosed()
                  .subscribe(() => {
                    this.router.navigateByUrl(
                      `admin/masterdata/${this.masterdataType}/view`
                    );
                  });
            }
          } else {
            this.showErrorPopup(updateResponse.errors[0].message);
          }
      });
    }
  }

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
