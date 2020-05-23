import {
    Component,
    OnInit,
    ViewEncapsulation,
    ElementRef,
    ViewChildren
  } from '@angular/core';
  import { Location } from '@angular/common';
  import { TranslateService } from '@ngx-translate/core';
  import { MatDialog } from '@angular/material/dialog';
  import { DataStorageService } from 'src/app/core/services/data-storage.service';
  import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
  import { FormGroup, FormBuilder, Validators } from '@angular/forms';
  import Utils from '../../../../app.utils';
  import * as appConstants from '../../../../app.constants';
  import { AppConfigService } from 'src/app/app-config.service';
  import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
  import { HeaderModel } from 'src/app/core/models/header.model';
  import { MispModel } from 'src/app/core/models/misp.model';
  import { RequestModel } from 'src/app/core/models/request.model';
  import { MispService } from 'src/app/core/services/misp.service';
  import { CenterRequest } from 'src/app/core/models/centerRequest.model';
  import { FilterModel } from 'src/app/core/models/filter.model';
  import { Observable } from 'rxjs';
  import { FilterRequest } from 'src/app/core/models/filter-request.model';
  import { FilterValuesModel } from 'src/app/core/models/filter-values.model';
  import {
    MatKeyboardRef,
    MatKeyboardComponent,
    MatKeyboardService
  } from 'ngx7-material-keyboard';
  import { AuditService } from 'src/app/core/services/audit.service';
  import * as mispSpecFile from '../../../../../assets/entity-spec/misp.json';
  
  @Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    encapsulation: ViewEncapsulation.None
  })
  export class CreateComponent {
    secondaryLanguageLabels: any;
    primaryLang: string;
    secondaryLang: string;
    // dropDownValues = new CenterDropdown();
    allSlots: string[];
    disableForms: boolean;
    headerObject: HeaderModel;
    centerRequest = {} as CenterRequest;
    createUpdate = false;
    misp:QueryModel;
  
    primaryForm: FormGroup;
    secondaryForm: FormGroup;
  
    data = [];

    popupMessages: any;
  
    selectedField: HTMLElement;
  
    private keyboardRef: MatKeyboardRef<MatKeyboardComponent>;
    @ViewChildren('keyboardRef', { read: ElementRef })
    private attachToElementMesOne: any;
  
    primaryKeyboard: string;
    secondaryKeyboard: string;
  
    keyboardType: string;
    subscribed: any;
  
    constructor(
      private location: Location,
      private translateService: TranslateService,
      private dataStorageService: DataStorageService,
      private dialog: MatDialog,
      private formBuilder: FormBuilder,
      private appConfigService: AppConfigService,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private mispService: MispService,
      private keyboardService: MatKeyboardService,
      private auditService: AuditService
    ) {
      this.subscribed = router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.initializeComponent();
        }
      });
      // tslint:disable-next-line:no-string-literal
      this.primaryLang = appConfigService.getConfig()['primaryLangCode'];
      // tslint:disable-next-line:no-string-literal
      this.secondaryLang = appConfigService.getConfig()['secondaryLangCode'];
      translateService.use(this.primaryLang);
      this.primaryKeyboard = appConstants.keyboardMapping[this.primaryLang];
      this.secondaryKeyboard = appConstants.keyboardMapping[this.secondaryLang];
    }
  
    initializeComponent() {
      this.activatedRoute.params.subscribe(params => {
        const routeParts = this.router.url.split('/');
        if (routeParts[routeParts.length - 2] === 'single-view') {
          this.auditService.audit(8, mispSpecFile.auditEventIds[1], 'misps');
          this.disableForms = true;
          this.getData(params); 
        } else {
          this.auditService.audit(16, 'ADM-096');
          this.initializeheader();
        }
      });
      this.translateService
        .getTranslation(this.secondaryLang)
        .subscribe(response => {
          this.secondaryLanguageLabels = response.center;
          console.log(this.secondaryLanguageLabels);
        });
      this.initializePrimaryForm();
      this.initializeSecondaryForm();
      this.translateService
        .getTranslation(this.primaryLang)
        .subscribe(response => {
          this.popupMessages = response.misp.popupMessages;
        });
    } 
  
    onCreate() {
      let data = {};
      if (
        this.secondaryForm.controls.name.value === '' ||
        this.secondaryForm.controls.addressLine1.value === ''
      ) {
        data = {
          case: 'CONFIRMATION',
          title: this.popupMessages['create'].title,
          message: this.popupMessages['create'].mandatorySecondaryFields,
          yesBtnTxt: this.popupMessages['create'].yesBtnText,
          noBtnTxt: this.popupMessages['create'].noBtnText
        };
      } else {
        if (this.data.length === 0) {
         // const zone = this.dropDownValues.zone.primary.filter(z => z.code === this.primaryForm.controls.zone.value);
          data = {
            case: 'CONFIRMATION',
            title: this.popupMessages['create'].title,
            message: this.popupMessages['create'].message[0],// + zone[0].name + this.popupMessages['create'].message[1],
            yesBtnTxt: this.popupMessages['create'].yesBtnText,
            noBtnTxt: this.popupMessages['create'].noBtnText
          };
        } else {
          data = {
            case: 'CONFIRMATION',
            title: this.popupMessages['edit'].title,
            message: this.popupMessages['edit'].message,
            yesBtnTxt: this.popupMessages['edit'].yesBtnText,
            noBtnTxt: this.popupMessages['edit'].noBtnText
          };
        }
      }

      if (this.data.length === 0) {
        this.auditService.audit(18, 'ADM-104', 'create');
        this.saveData();
      } else if (this.data.length !== 0) {
        this.auditService.audit(18, 'ADM-105', 'edit');
        this.updateData();
      }
      // const dialogRef = this.dialog.open(DialogComponent, {
      //   width: '350px',
      //   data
      // });
      // dialogRef.afterClosed().subscribe(response => {
      //   if (response && this.data.length === 0) {
      //     this.auditService.audit(18, 'ADM-104', 'create');
      //     this.saveData();
      //   } else if (response && this.data.length !== 0) {
      //     this.auditService.audit(18, 'ADM-105', 'edit');
      //     this.updateData();
      //   } else if (!response && this.data.length === 0) {
      //     this.auditService.audit(19, 'ADM-106', 'create');
      //   } else if (!response && this.data.length !== 0) {
      //     this.auditService.audit(19, 'ADM-107', 'edit');
      //   }
      // });
    }
  
    updateData() {
      this.createUpdate = true;
      const primaryObject = new MispModel(        
        this.primaryForm.controls.name.value,
        this.primaryForm.controls.address.value,
        this.primaryForm.controls.contactPhone.value,
        this.primaryForm.controls.email_id.value,
        false,
        this.headerObject.id,
        ""
      );
      const secondaryObject = new MispModel(        
        this.secondaryForm.controls.name.value,
        this.secondaryForm.controls.address.value,
        this.secondaryForm.controls.contactPhone.value,
        this.secondaryForm.controls.email_id.value,
        false,
        this.headerObject.id,
        ""        
      );
      const request = new RequestModel(
        appConstants.registrationCenterCreateId,
        null,
        primaryObject
      );
      console.log(request);
      this.dataStorageService.updateCenter(request).subscribe(updateResponse => {
        console.log(updateResponse);
        if (!updateResponse.errors || updateResponse.errors.length === 0) {
          if (this.secondaryForm.valid) {
            const secondaryRequest = new RequestModel(
              appConstants.registrationCenterCreateId,
              null,
              secondaryObject
            );
            this.dataStorageService
              .updateCenter(secondaryRequest)
              .subscribe(secondaryResponse => {
                if (
                  !secondaryResponse.errors ||
                  secondaryResponse.errors.length === 0
                ) {
                  this.showMessage('update-success');
                    // .afterClosed()
                    // .subscribe(() => {
                    //   this.router.navigateByUrl('admin/resources/centers/view');
                    // });
                } else {
                  this.showMessage('update-error');
                }
              });
          } else {
            this.showMessage('update-success');
          }
        } else {
          this.showMessage('update-error');
        }
      });
    }
  
    showMessage(type: string, data?: any) {
      const dialogRef = this.dialog.open(DialogComponent, {
        width: '350px',
        data: {
          case: 'MESSAGE',
          title: this.popupMessages[type].title,
          message:
            type === 'create-success'
              ? this.popupMessages[type].message
              //[0] 
                // +
                // data.id +
                // this.popupMessages[type].message[1] +
                // data.name
              : this.popupMessages[type].message,
          btnTxt: this.popupMessages[type].btnTxt
        }
      })
      .afterClosed()
                      .subscribe(() => {
                        this.primaryForm.reset();
                        this.secondaryForm.reset();
                        this.router.navigateByUrl('admin/resources/misp/view');
                      });
      return dialogRef;
    }
  
    saveData() {
      this.createUpdate = true;
      const primaryObject = new MispModel(        
        this.primaryForm.controls.name.value,
        this.primaryForm.controls.address.value,
        this.primaryForm.controls.contactPhone.value,
        this.primaryForm.controls.email_id.value,
        false,   
        this.headerObject.id,
        ''
      );
      const secondaryObject = new MispModel(        
        this.primaryForm.controls.name.value,
        this.primaryForm.controls.address.value,
        this.primaryForm.controls.contactPhone.value,
        this.primaryForm.controls.email_id.value,
        false,
        this.headerObject.id,
        ''
      );
      const primaryRequest = new RequestModel(
        appConstants.registrationCenterCreateId,
        null,
        primaryObject
      );
      console.log(primaryRequest);
      this.dataStorageService
        .createMisp(primaryRequest)
        .subscribe(createResponse => {
          console.log(createResponse);
          if (!(createResponse.errors.length != 0)) {
            if (this.secondaryForm.valid) {
              const secondaryRequest = new RequestModel(
                appConstants.registrationCenterCreateId,
                null,
                secondaryObject
              );
              this.dataStorageService
                .createMisp(secondaryRequest)
                .subscribe(secondaryResponse => {
                  if (!secondaryResponse.errors) {
                    this.showMessage('create-success', secondaryResponse.response);
                      // .afterClosed()
                      // .subscribe(() => {
                      //   this.primaryForm.reset();
                      //   this.secondaryForm.reset();
                      //   this.router.navigateByUrl('admin/resources/misp/view');
                      // });
                  } else {
                    this.showMessage('create-error');
                  }
                });
            } else {
              this.showMessage('create-success', createResponse.response);
            }
          } else {
            this.showMessage('create-error');
          }
        });
    }
  
    async getData(params: any) {
      const filter = new FilterModel('id', 'equals', params.id);
      this.centerRequest.filters = [filter];
      this.centerRequest.languageCode = this.primaryLang;
      this.centerRequest.sort = [];
      this.centerRequest.pagination = { pageStart: 0, pageFetch: 10 };
      this.misp = new QueryModel();
      this.misp.id = params.id;
      let request = new RequestModel(
        appConstants.registrationCenterCreateId,
        null,
        this.misp
      );
      this.mispService.getMispDetails(request).subscribe(
        response => {
          if (response.response) {            
            this.data[0] = response.response;            
            this.initializeheader();
            this.setPrimaryFormValues();
            this.centerRequest.languageCode = this.secondaryLang;
            request = new RequestModel(
              appConstants.registrationCenterCreateId,
              null,
              this.centerRequest
            );
            this.mispService
              .getRegistrationMispDetails(request)
              .subscribe(secondaryResponse => {
                this.data[1] = secondaryResponse.response.data
                  ? secondaryResponse.response.data[0]
                  : {};
                this.setSecondaryFormValues();
                if (
                  this.activatedRoute.snapshot.queryParams.editable === 'true'
                ) {
                  this.disableForms = false;
                  this.primaryForm.enable();
                  this.initializeSecondaryForm();
                  this.setSecondaryFormValues();
                  this.primaryForm.controls.noKiosk.enable();
                  this.primaryForm.controls.isActive.enable();
                }
              });
          } else {
            this.showErrorPopup();
          }
        },
        error => this.showErrorPopup()
      );
    }
  
    showErrorPopup() {
      this.dialog
        .open(DialogComponent, {
          width: '350px',
          data: {
            case: 'MESSAGE',
            // tslint:disable-next-line:no-string-literal
            title: this.popupMessages['noData']['title'],
            message: this.popupMessages['noData']['message'],
            // tslint:disable-next-line:no-string-literal
            btnTxt: this.popupMessages['noData']['btnTxt']
          },
          disableClose: true
        })
        .afterClosed()
        .subscribe(() =>
          this.router.navigateByUrl(`admin/resources/misp/view`)
        );
    }
  
    setPrimaryFormValues() {
      this.primaryForm.controls.name.setValue(this.data[0].name);
      this.primaryForm.controls.contactPhone.setValue(this.data[0].contactNumber);
      this.primaryForm.controls.email_id.setValue(this.data[0].emailId);
      this.primaryForm.controls.address.setValue(this.data[0].address);
    }
  
    setSecondaryFormValues() {
      this.secondaryForm.controls.name.setValue(
        this.data[1].name ? this.data[1].name : ''
      );
    
      this.secondaryForm.controls.contactPhone.setValue(
        this.data[0].contactPhone
      );
      this.secondaryForm.controls.email_id.setValue(this.data[0].email_id);
      this.secondaryForm.controls.address.setValue(
        this.data[1].addressLine1 ? this.data[1].addressLine1 : ''
      );
    }
  
    initializeheader() {
      if (this.data.length === 0) {
        this.headerObject = new HeaderModel('-', '-', '-', '-', '-', '-', '-');
      } else {
        this.headerObject = new HeaderModel(
          this.data[0].name,
          this.data[0].createdDateTime ? this.data[0].createdDateTime : '-',
          this.data[0].createdBy ? this.data[0].createdBy : '-',
          this.data[0].updatedDateTime ? this.data[0].updatedDateTime : '-',
          this.data[0].updatedBy ? this.data[0].updatedBy : '-',
          this.data[0].id,
          this.data[0].isActive
        );
      }
    }
  
    naviagteBack() {
      this.location.back();
    }

    initializePrimaryForm() {
      this.primaryForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.maxLength(128)]],
        contactPhone: ['',[Validators.required, Validators.maxLength(13)]],
        email_id: [
          '',
          [Validators.required, Validators.maxLength(32)]
        ],
        address: ['', [Validators.required, Validators.maxLength(256)]]
      });
      if (this.disableForms) {
        this.primaryForm.disable();
      }
    }
  
    initializeSecondaryForm() {
      this.secondaryForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.maxLength(128)]],
        contactPhone: ['',[Validators.required, Validators.maxLength(13)]],
        email_id: [
          '',
          [Validators.required, Validators.maxLength(32)]
        ],
        address: ['', [Validators.required, Validators.maxLength(256)]]
      });
      if (this.disableForms) {
        this.secondaryForm.disable();
      }
    }
  
    get primary() {
      return this.primaryForm.controls;
    }
  
    get secondary() {
      return this.secondaryForm.controls;
    }
  
    submit() {
      if (!this.disableForms) {
        this.auditService.audit(17, 'ADM-097');
        if (this.primaryForm.valid) {
          for (const i in this.secondaryForm.controls) {
            if (this.secondaryForm.controls[i]) {
              this.secondaryForm.controls[i].markAsTouched();
            }
          }
          this.onCreate();
        } else {
          for (const i in this.primaryForm.controls) {
            if (this.primaryForm.controls[i]) {
              this.primaryForm.controls[i].markAsTouched();
              this.secondaryForm.controls[i].markAsTouched();
            }
          }
        }
      } else {
        this.disableForms = false;
        this.primaryForm.enable();
        this.initializeSecondaryForm();
        this.setSecondaryFormValues();
        this.primaryForm.controls.noKiosk.enable();
        this.primaryForm.controls.isActive.enable();
      }
    }
  
    // copyDataToSecondaryForm(fieldName: string, value: string) {
    //   if (this.primaryForm.controls[fieldName].valid) {
    //     this.secondaryForm.controls[fieldName].setValue(value);
    //   } else {
    //     this.secondaryForm.controls[fieldName].setValue('');
    //   }
    // }
  
    

    cancel() {
      this.location.back();
    }  
  
    scrollPage(
      element: HTMLElement,
      type: string,
      formControlName: string,
      index: number
    ) {
      element.scrollIntoView({ block: 'center', inline: 'nearest' });
      this.selectedField = element;
      if (this.keyboardRef) {
        this.keyboardRef.instance.setInputInstance(
          this.attachToElementMesOne._results[index]
        );
        if (type === 'primary') {
          this.keyboardRef.instance.attachControl(
            this.primaryForm.controls[formControlName]
          );
        } else if (type === 'secondary') {
          this.keyboardRef.instance.attachControl(
            this.secondaryForm.controls[formControlName]
          );
        }
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
  
    canDeactivate(): Observable<any> | boolean {
      if (this.keyboardService.isOpened) {
        this.keyboardService.dismiss();
      }
      this.subscribed.unsubscribe();
      if (
        (this.primaryForm.touched || this.secondaryForm.touched) &&
        !this.createUpdate
      ) {
        return this.dialog
          .open(DialogComponent, {
            width: '350px',
            data: {
              case: 'CONFIRMATION',
              title: this.popupMessages['navigation-popup'].title,
              message: this.popupMessages['navigation-popup'].message,
              yesBtnTxt: this.popupMessages['navigation-popup'].yesBtnTxt,
              noBtnTxt: this.popupMessages['navigation-popup'].noBtnTxt
            }
          })
          .afterClosed();
      } else {
        return true;
      }
    }
  }

  export class QueryModel{
    constructor(
    ){}

    public name : string;
    public address:string;
    public contactNumber:string;
    public emailId:string;
    public isActive:boolean;
    public id:string;
    public mispStatus:string;

}
  