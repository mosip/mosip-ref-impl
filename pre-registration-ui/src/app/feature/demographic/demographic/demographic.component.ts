import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  HostListener,
  ViewChildren,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { MatDialog } from "@angular/material";
import { TranslateService } from "@ngx-translate/core";

import { DataStorageService } from "src/app/core/services/data-storage.service";
import { RegistrationService } from "src/app/core/services/registration.service";

import { UserModel } from "src/app/shared/models/demographic-model/user.modal";
import { CodeValueModal } from "src/app/shared/models/demographic-model/code.value.modal";
import * as appConstants from "../../../app.constants";
import Utils from "src/app/app.util";
import { DialougComponent } from "src/app/shared/dialoug/dialoug.component";
import { ConfigService } from "src/app/core/services/config.service";
import { AttributeModel } from "src/app/shared/models/demographic-model/attribute.modal";
import { FilesModel } from "src/app/shared/models/demographic-model/files.model";
import {
  MatKeyboardService,
  MatKeyboardRef,
  MatKeyboardComponent,
} from "ngx7-material-keyboard";
import { LogService } from "src/app/shared/logger/log.service";
import LanguageFactory from "src/assets/i18n";
import { FormDeactivateGuardService } from "src/app/shared/can-deactivate-guard/form-guard/form-deactivate-guard.service";
import { Subscription } from "rxjs";
import { ValueConverter } from "@angular/compiler/src/render3/view/template";
import { Engine, Rule } from 'json-rules-engine';
import moment from 'moment';

/**
 * @description This component takes care of the demographic page.
 * @author Shashank Agrawal
 *
 * @export
 * @class DemographicComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: "app-demographic",
  templateUrl: "./demographic.component.html",
  styleUrls: ["./demographic.component.css"],
})
export class DemographicComponent
  extends FormDeactivateGuardService
  implements OnInit, OnDestroy {
  textDir = localStorage.getItem("dir");
  secTextDir = localStorage.getItem("secondaryDir");
  primaryLang = localStorage.getItem("langCode");
  secondaryLang = localStorage.getItem("secondaryLangCode");
  languages = [this.primaryLang, this.secondaryLang];
  keyboardLang = appConstants.virtual_keyboard_languages[this.primaryLang];
  keyboardSecondaryLang =
    appConstants.virtual_keyboard_languages[this.secondaryLang];

    files: FilesModel;
  agePattern: string;
  MOBILE_PATTERN: string;
  MOBILE_LENGTH: string;
  EMAIL_PATTERN: string;
  EMAIL_LENGTH: string;
  DOB_PATTERN: string;
  ADDRESS_PATTERN: string;
  defaultDay: string;
  defaultMonth: string;
  defaultLocation: string;
  date: string = "";
  month: string = "";
  year: string = "";
  currentAge: string = "";
  ageOrDobPref = "";
  showDate = false;
  isNewApplicant = false;
  checked = true;
  dataUploadComplete = true;
  hasError = false;
  dataModification: boolean;
  showPreviewButton = false;
  dataIncomingSuccessful = false;
  canDeactivateFlag = true;
  hierarchyAvailable = true;
  isConsentMessage = false;
  isReadOnly = false;
  
  step: number = 0;
  id: number;
  oldAge: number;
  oldKeyBoardIndex: number;
  numberOfApplicants: number;
  userForm = new FormGroup({});
  transUserForm = new FormGroup({});
  maxDate = new Date(Date.now());
  preRegId = "";
  loginId = "";
  user: UserModel = new UserModel();
  demodata: string[];
  secondaryLanguagelabels: any;
  demographiclabels: any;
  errorlabels: any;
  uppermostLocationHierarchy: any;
  primaryGender = [];
  secondaryGender = [];
  primaryResidenceStatus = [];
  secondaryResidenceStatus = [];
  secondaryResidenceStatusTemp = [];
  genders: any;
  residenceStatus: any;
  message = {};
  config = {};
  consentMessage: any;
  titleOnError = "";

  @ViewChild("dd") dd: ElementRef;
  @ViewChild("mm") mm: ElementRef;
  @ViewChild("yyyy") yyyy: ElementRef;
  @ViewChild("age") age: ElementRef;

  private _keyboardRef: MatKeyboardRef<MatKeyboardComponent>;
  @ViewChildren("keyboardRef", { read: ElementRef })
  private _attachToElementMesOne: any;

  regions_in_primary_lang: CodeValueModal[] = [];
  regions_in_secondary_lang: CodeValueModal[] = [];
  regions: CodeValueModal[][] = [
    this.regions_in_primary_lang,
    this.regions_in_secondary_lang,
  ];
  provinces_in_primary_lang: CodeValueModal[] = [];
  provinces_in_secondary_lang: CodeValueModal[] = [];
  provinces: CodeValueModal[][] = [
    this.provinces_in_primary_lang,
    this.provinces_in_secondary_lang,
  ];
  cities_in_primary_lang: CodeValueModal[] = [];
  cities_in_secondary_lang: CodeValueModal[] = [];
  cities: CodeValueModal[][] = [
    this.cities_in_primary_lang,
    this.cities_in_secondary_lang,
  ];
  zones_in_primary_lang: CodeValueModal[] = [];
  zones_in_secondary_lang: CodeValueModal[] = [];
  zones: CodeValueModal[][] = [
    this.zones_in_primary_lang,
    this.zones_in_secondary_lang,
  ];
  locations = [this.regions, this.provinces, this.cities, this.zones];
  selectedLocationCode = [];
  codeValue: CodeValueModal[] = [];
  subscriptions: Subscription[] = [];

  identityData = [];
  uiFields = [];
  jsonRulesEngine = new Engine();
  primaryuserForm = false;
  primarydropDownFields = {};
  secondaryDropDownLables = {};
  secondaryuserForm = false;
  locationHeirarchies = [];
  validationMessage: any;
  dynamicFields = [];
  dynamicFieldAndValues = [];
  /**
   * @description Creates an instance of DemographicComponent.
   * @param {Router} router
   * @param {RegistrationService} regService
   * @param {DataStorageService} dataStorageService
   * @param {BookingService} bookingService
   * @param {ConfigService} configService
   * @param {TranslateService} translate
   * @param {MatDialog} dialog
   * @memberof DemographicComponent
   */
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private regService: RegistrationService,
    private dataStorageService: DataStorageService,
    private configService: ConfigService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private matKeyboardService: MatKeyboardService,
    private loggerService: LogService // private errorService: ErrorService
  ) {
    super(dialog);
    this.translate.use(localStorage.getItem("langCode"));
    this.subscriptions.push(
      this.regService
        .getMessage()
        .subscribe((message) => (this.message = message))
    );
  }

  /**
   * @description This is the angular life cycle hook called upon loading the component.
   *
   * @memberof DemographicComponent
   */
  async ngOnInit() {
    this.initialization();
    await this.getIdentityJsonFormat();
    this.config = this.configService.getConfig();
    this.getPrimaryLabels();
    await this.getConsentMessage();
    this.validationMessage = appConstants.errorMessages;
    let factory = new LanguageFactory(this.secondaryLang);
    let response = factory.getCurrentlanguage();
    this.secondaryLanguagelabels = response["demographic"];
    this.initForm();
    await this.setFormControlValues();
    if (!this.dataModification) {
      if (this.isConsentMessage) this.consentDeclaration();
    }
    this.showHideFormFields();
  }
  
  /**

   * @description This will return the json object of label of demographic in the primary language.
   *
   * @private
   * @returns the `Promise`
   * @memberof DemographicComponent
   */
  private getPrimaryLabels() {
    let factory = new LanguageFactory(this.primaryLang);
    let response = factory.getCurrentlanguage();
    this.demographiclabels = response["demographic"];
    this.errorlabels = response["error"];
  }

  private getConsentMessage() {
    return new Promise((resolve, reject) => {
      this.subscriptions.push(
        this.dataStorageService.getGuidelineTemplate("consent").subscribe(
          (response) => {
            this.isConsentMessage = true;
            if (response && response[appConstants.RESPONSE])
              this.consentMessage = response["response"][
                "templates"
              ][0].fileText.split("\n");
            else if (response[appConstants.NESTED_ERROR])
              this.onError(this.errorlabels.error, "");
            resolve(true);
          },
          (error) => {
            this.isConsentMessage = false;
            this.onError(this.errorlabels.error, error);
          }
        )
      );
    });
  }

  /**
   * @description This method do the basic initialization,
   * if user is opt for updation or creating the new applicaton
   *
   * @private
   * @memberof DemographicComponent
   */
  private async initialization() {
    if (localStorage.getItem("newApplicant") === "true") {
      this.isNewApplicant = true;
    }
    if (localStorage.getItem("modifyUser") === "true") {
      console.log(localStorage.getItem("modifyUser"));
      this.dataModification = true;
      await this.getPreRegId();
      await this.getUserInfo(this.preRegId);
      if (localStorage.getItem("modifyUserFromPreview") === "true") {
        this.showPreviewButton = true;
      }
      this.loginId = localStorage.getItem("loginId");
    }
  }

  getPreRegId() {
    return new Promise((resolve) => {
      this.activatedRoute.params.subscribe((param) => {
        this.preRegId = param["appId"];
        console.log(this.preRegId);
        resolve(true);
      });
    });
  }

  getUserInfo(preRegId) {
    return new Promise((resolve) => {
      this.dataStorageService.getUser(preRegId).subscribe((response) => {
        if (response[appConstants.RESPONSE]) {
          this.user.request = response[appConstants.RESPONSE];
          console.log(this.user.request);
          resolve(response[appConstants.RESPONSE]);
        }
      });
    });
  }
  /**
   * @description This is the consent form, which applicant has to agree upon to proceed forward.
   *
   * @private
   * @memberof DemographicComponent
   */
  private consentDeclaration() {
    if (this.demographiclabels) {
      const data = {
        case: "CONSENTPOPUP",
        title: this.demographiclabels.consent.title,
        subtitle: this.demographiclabels.consent.subtitle,
        message: this.consentMessage,
        checkCondition: this.demographiclabels.consent.checkCondition,
        acceptButton: this.demographiclabels.consent.acceptButton,
        alertMessageFirst: this.demographiclabels.consent.alertMessageFirst,
        alertMessageSecond: this.demographiclabels.consent.alertMessageSecond,
        alertMessageThird: this.demographiclabels.consent.alertMessageThird,
      };
      this.dialog.open(DialougComponent, {
        width: "550px",
        data: data,
        disableClose: true,
      });
    }
  }

  /**
   * @description This method will get the Identity Schema Json
   *
   *
   */

  async getIdentityJsonFormat() {
    return new Promise((resolve, reject) => {
      this.dataStorageService.getIdentityJson().subscribe((response) => {
        console.log(response);
        // this.identityData = response["identity"];
        // this.locationHeirarchy = [...response["locationHierarchy"]];
        this.identityData = response["response"]["idSchema"]["identity"];
        let locationHeirarchiesFromJson = [
          ...response["response"]["idSchema"]["locationHierarchy"],
        ];
        if (Array.isArray(locationHeirarchiesFromJson[0])) {
          this.locationHeirarchies = locationHeirarchiesFromJson;  
        } else {
          let hierarchiesArray = [];
          hierarchiesArray.push(locationHeirarchiesFromJson);
          this.locationHeirarchies = hierarchiesArray;
        }
        localStorage.setItem("locationHierarchy",JSON.stringify(this.locationHeirarchies[0]));
        
        this.identityData.forEach((obj) => {
          if (
            obj.inputRequired === true &&
            obj.controlType !== null &&
            !(obj.controlType === "fileupload")
          ) {
            this.uiFields.push(obj);
          }
        });
        this.dynamicFields = this.uiFields.filter(
          (fields) =>
            fields.controlType === "dropdown" && fields.fieldType === "dynamic"
        );
        console.log(this.dynamicFields);
        this.setDropDownArrays();
        this.setLocations();
        this.setGender();
        this.setResident();
        this.setDynamicFieldValues();
        resolve(true);
      });
    });
  }
  /**
   * @description This will initialize the demographic form and
   * if update set the inital values of the attributes.
   *
   *
   * @memberof DemographicComponent
   */
  async initForm() {
    this.uiFields.forEach((control, index) => {
      this.userForm.addControl(control.id, new FormControl(""));
      if (this.primaryLang !== this.secondaryLang) {
        this.transUserForm.addControl(control.id, new FormControl(""));
      }
      if (control.required) {
        this.userForm.controls[`${control.id}`].setValidators(
          Validators.required
        );
        if (this.primaryLang !== this.secondaryLang) {
          this.transUserForm.controls[`${control.id}`].setValidators(
            Validators.required
          );
        }
      }
      if (control.validators !== null && control.validators.length > 0) {
        this.userForm.controls[`${control.id}`].setValidators([
          Validators.pattern(control.validators[0].validator),
        ]);
        if (this.primaryLang !== this.secondaryLang) {
          this.transUserForm.controls[`${control.id}`].setValidators([
            Validators.pattern(control.validators[0].validator),
          ]);
        }
      }
      if (
        control.required &&
        control.validators !== null &&
        control.validators.length > 0
      ) {
        this.userForm.controls[`${control.id}`].setValidators([
          Validators.required,
          Validators.pattern(control.validators[0].validator),
        ]);
        if (this.primaryLang !== this.secondaryLang) {
          this.transUserForm.controls[`${control.id}`].setValidators([
            Validators.required,
            Validators.pattern(control.validators[0].validator),
          ]);
        }
      }
      if (this.uiFields.length === index + 1) {
        this.primaryuserForm = true;
        if (this.primaryLang !== this.secondaryLang) {
          this.secondaryuserForm = true;
        }
      }
    });
  }

  /**
   * @description sets the dropdown arrays for primary and secondary forms.
   */
  setDropDownArrays() {
    this.getIntialDropDownArrays();
  }
  /**
   * @description this method initialise the primary and secondary dropdown array for the
   *  dropdown fields.
   */
  getIntialDropDownArrays() {
    this.uiFields.forEach((control) => {
      if (control.controlType === "dropdown") {
        this.primarydropDownFields[control.id] = [];
        if (this.primaryLang !== this.secondaryLang) {
          this.secondaryDropDownLables[control.id] = [];
        }
      }
    });
  }

  isThisFieldInLocationHeirarchies = (fieldId) => {
    let items = this.getLocationHierarchy(fieldId);
    return items.length > 0 ? true: false;
  }

  getIndexInLocationHeirarchy = (fieldId) => {
    let items = this.getLocationHierarchy(fieldId);
    return items.indexOf(fieldId);
  }

  getLocationNameFromIndex = (fieldId, fieldIndex) => {
    let items = this.getLocationHierarchy(fieldId);
    return items[fieldIndex];
  }

  getLocationHierarchy = (fieldId) => {
    let items = [];
    this.locationHeirarchies.forEach(locationHeirarchy => {
      let filteredItems = locationHeirarchy.filter(item => item == fieldId);
      if (filteredItems.length > 0) {
        items = locationHeirarchy;
      }
    });
    return items;
  }

  /**

   *
   * @description this method is to make dropdown api calls
   *
   * @param controlObject is Identity Type Object
   *  ex: { id : 'region',controlType: 'dropdown' ...}
   */
  dropdownApiCall(controlObject: any) {
    if (this.isThisFieldInLocationHeirarchies(controlObject.id)) {
      if (this.getIndexInLocationHeirarchy(controlObject.id) !== 0) {
        this.primarydropDownFields[controlObject.id] = [];
        const locationIndex = this.getIndexInLocationHeirarchy(controlObject.id);
        const parentLocationName = this.getLocationNameFromIndex(controlObject.id, locationIndex - 1);
        let locationCode = this.userForm.get(`${parentLocationName}`).value;
        this.loadLocationData(locationCode, controlObject.id);
      }
    }
  }

  /**
   * @description this method will copy dropdown values from its
   * respective dropdown inputs to it's ssecondary input
   *
   * @param fieldName input field
   * @param fieldValue input field value
   */
  copyDataToSecondaryForm(fieldName: string, fieldValue: string) {
    if (this.primaryLang !== this.secondaryLang) {
      this.secondaryDropDownLables[fieldName].forEach((element) => {
        if (element.valueCode === fieldValue) {
          this.transUserForm.controls[fieldName].setValue(fieldValue);
        }
      });
    }
  }

  /**

   * @description This method will copy non dropdown field values
   * from primary form to secondary form
   *
   * @param fieldName input field name
   * @param event event type
   */
  copyToSecondaryFormNonDropDown(fieldName: string, event: Event) {
    const transliterate = [...appConstants.TRANSLITERATE_FIELDS];
    if(this.primaryLang !== this.secondaryLang){
      if (transliterate.includes(fieldName)) {
        if (event.type === "focusout") {
          this.onTransliteration(fieldName, fieldName);
        }
      } else {
        this.transUserForm.controls[`${fieldName}`].setValue(
          this.userForm.controls[`${fieldName}`].value
        );
      }
    }
  }

  /**
   * This function will reset the value of the hidden field in the form.
   * @param uiField 
   */
  resetHiddenField = (uiField) => {
    this.userForm.controls[uiField.id].setValue("");
    if (this.primaryLang !== this.secondaryLang){
      if (this.transUserForm && this.transUserForm.controls[`${uiField.id}`]) {
        this.transUserForm.controls[`${uiField.id}`].setValue("");
      }  
    }
  }

  /**
   * This function looks for "visibleCondition" attribute for each field in UI Specs.
   * Using "json-rules-engine", these conditions are evaluated 
   * and fields are shown/hidden in the UI form.
   */
  showHideFormFields() {
    if (!this.dataModification || (this.dataModification && this.userForm.valid) ) {
      //populate form data in json for json-rules-engine to evalatute the conditions
      const identityFormData = this.createIdentityJSONDynamic();
      //for each uiField in UI specs, check of any visibleCondition is given
      //if yes, then evaluate it with json-rules-engine
      this.uiFields.forEach(uiField => {
        //if no visibleCondition is given, then show the field
        if (!uiField.visibleCondition || uiField.visibleCondition == "") {
          uiField.isVisible = true;
        }
        else {
          let resetFieldToBlank = this.resetHiddenField;
          let visibilityRule = new Rule({
            conditions: uiField.visibleCondition,
            onSuccess() {
              //in visibleCondition is statisfied then show the field
              uiField.isVisible = true;
            },
            onFailure() {
              //in visibleCondition is not statisfied then hide the field
              uiField.isVisible = false;
              resetFieldToBlank(uiField);
            },
            event: {
              type: "message",
              params: {
                data: ""
              }
            }
          });
          this.jsonRulesEngine.addRule(visibilityRule);
          //evaluate the visibleCondition
          this.jsonRulesEngine
            .run(identityFormData)
            .then(results => {
              results.events.map(event => console.log('jsonRulesEngine run successfully', event.params.data));
              this.jsonRulesEngine.removeRule(visibilityRule);
            })
            .catch((error) => {
              console.log('err is', error);
              this.jsonRulesEngine.removeRule(visibilityRule);
            });
        }
      }, this.resetHiddenField
      );
    }
  }

  /**
   * @description This sets the top location hierachy,
   * if update set the regions also.
   *
   * @private
   * @memberof DemographicComponent
   */
  private async setLocations() {
    await this.getLocationMetadataHirearchy();
    this.locationHeirarchies.forEach(locationHeirarchy => {
      this.loadLocationData(
        this.uppermostLocationHierarchy,
        locationHeirarchy[0]
      );
    }, this);
    
  }
  /**
   * @description This is to reset the input values
   * when the parent input value is changed
   *
   * @param fieldName location dropdown control Name
   */
  resetLocationFields(fieldName: string) {
    if (this.isThisFieldInLocationHeirarchies(fieldName)) {
      const locationFields = this.getLocationHierarchy(fieldName);
      const index = locationFields.indexOf(fieldName);
      for (let i = index + 1; i < locationFields.length; i++) {
        this.userForm.controls[locationFields[i]].setValue("");
        if (this.primaryLang !== this.secondaryLang) {
          this.transUserForm.controls[locationFields[i]].setValue("");
        }
        this.userForm.controls[locationFields[i]].markAsUntouched();
        if (this.primaryLang !== this.secondaryLang) {
          this.transUserForm.controls[locationFields[i]].markAsUntouched();
        }
      }
    }
  }

  /**
   * @description This is get the location the input values
   *
   * @param fieldName location dropdown control Name
   * @param locationCode location code of parent location
   */
  loadLocationData(locationCode: string, fieldName: string) {
    if (fieldName && fieldName.length > 0) {
      this.dataStorageService
        .getLocationImmediateHierearchy(this.primaryLang, locationCode)
        .subscribe(
          (response) => {
            if (response[appConstants.RESPONSE]) {
              response[appConstants.RESPONSE][
                appConstants.DEMOGRAPHIC_RESPONSE_KEYS.locations
              ].forEach((element) => {
                let codeValueModal: CodeValueModal = {
                  valueCode: element.code,
                  valueName: element.name,
                  languageCode: this.primaryLang,
                };
                this.primarydropDownFields[`${fieldName}`].push(codeValueModal);
              });
            }
          },
          (error) => {
            console.log(error);
          }
        );
      if (this.primaryLang !== this.secondaryLang) {
        this.dataStorageService
          .getLocationImmediateHierearchy(this.secondaryLang, locationCode)
          .subscribe(
            (response) => {
              if (response[appConstants.RESPONSE]) {
                response[appConstants.RESPONSE][
                  appConstants.DEMOGRAPHIC_RESPONSE_KEYS.locations
                ].forEach((element) => {
                  let codeValueModal: CodeValueModal = {
                    valueCode: element.code,
                    valueName: element.name,
                    languageCode: this.secondaryLang,
                  };
                  this.secondaryDropDownLables[`${fieldName}`].push(
                    codeValueModal
                  );
                });
              }
            },
            (error) => {
              console.log(error);
            }
          );
      }
    }
  }

  /**
   * @description This is to get the list of gender available in the master data.
   *
   * @private
   * @memberof DemographicComponent
   */
  private async setGender() {
    await this.getGenderDetails();
    await this.filterOnLangCode(
      this.primaryLang,
      appConstants.controlTypeGender,
      this.genders
    );
    if (this.primaryLang !== this.secondaryLang) {
      await this.filterOnLangCode(
        this.secondaryLang,
        appConstants.controlTypeGender,
        this.genders
      );
    }
  }

  private async setDynamicFieldValues() {
    await this.getDynamicFieldValues(this.primaryLang);
    if (this.primaryLang !== this.secondaryLang) {
      await this.getDynamicFieldValues(this.secondaryLang);
    }
  }

  getDynamicFieldValues(lang) {
    return new Promise((resolve) => {
      this.dataStorageService
        .getDynamicFieldsandValues(lang)
        .subscribe((response) => {
          //console.log(response);
          let dynamicField = response[appConstants.RESPONSE]["data"];
          this.dynamicFields.forEach((field) => {
            //console.log(field);
            dynamicField.forEach((res) => {
              //console.log(res);
              if (field.id === res.name && res.langCode === this.primaryLang) {
                //console.log(res["fieldVal"]);
                this.filterOnLangCode(
                  this.primaryLang,
                  res.name,
                  res["fieldVal"]
                );
                //console.log(this.primarydropDownFields);
              }
              if (this.primaryLang !== this.secondaryLang) {
                if (
                  field.id === res.name &&
                  res.langCode === this.secondaryLang
                ) {
                  this.filterOnLangCode(
                    this.secondaryLang,
                    res.name,
                    res["fieldVal"]
                  );
                }
              }
            });
          });
        });
      resolve(true);
    });
  }

  /**
   * @description This is to get the list of gender available in the master data.
   *
   * @private
   * @memberof DemographicComponent
   */
  private async setResident() {
    await this.getResidentDetails();
    await this.filterOnLangCode(
      this.primaryLang,
      appConstants.controlTypeResidenceStatus,
      this.residenceStatus
    );
    if (this.primaryLang !== this.secondaryLang) {
      await this.filterOnLangCode(
        this.secondaryLang,
        appConstants.controlTypeResidenceStatus,
        this.residenceStatus
      );
    }
  }

  /**
   * @description This set the initial values for the form attributes.
   *
   * @memberof DemographicComponent
   */
  async setFormControlValues() {
    if (this.primaryLang === this.secondaryLang) {
      this.languages.pop();
      this.isReadOnly = true;
    }
    if (!this.dataModification) {
      this.uiFields.forEach((control) => {
        this.userForm.controls[control.id].setValue("");
        if (this.primaryLang !== this.secondaryLang) {
          this.transUserForm.controls[control.id].setValue("");
        }
      });
    } else {
      let index = 0;
      let secondaryIndex = 1;
      this.loggerService.info("user", this.user);
      console.log("user", this.user);
      if (this.user.request === undefined) {
        await this.getUserInfo(this.preRegId);
      }
      /*if (
        this.user.request.demographicDetails.identity.fullName[0].language !==
        this.primaryLang
      ) {
        index = 1;
        secondaryIndex = 0;
      }*/
      if (this.primaryLang === this.secondaryLang) {
        index = 0;
        secondaryIndex = 0;
      }
      this.uiFields.forEach((control) => {
        if (
          control.controlType !== "dropdown" &&
          !appConstants.TRANSLITERATE_FIELDS.includes(control.id)
        ) {
          if (control.id === "dateOfBirth") {
            this.setDateOfBirth();
          } else {
            if(typeof(this.user.request.demographicDetails.identity[`${control.id}`]) == "object"){
              this.userForm.controls[`${control.id}`].setValue(
                this.user.request.demographicDetails.identity[`${control.id}`][0].value
              );
            }else{
              this.userForm.controls[`${control.id}`].setValue(
                this.user.request.demographicDetails.identity[`${control.id}`]
              );
            }            
            if (this.primaryLang !== this.secondaryLang) {
              this.transUserForm.controls[`${control.id}`].setValue(
                this.user.request.demographicDetails.identity[`${control.id}`]
              );
            }
          }
        } else if (appConstants.TRANSLITERATE_FIELDS.includes(control.id)) {
          this.userForm.controls[`${control.id}`].setValue(
            this.user.request.demographicDetails.identity[control.id][index]
              .value
          );
          if (this.primaryLang !== this.secondaryLang) {
            this.transUserForm.controls[`${control.id}`].setValue(
              this.user.request.demographicDetails.identity[control.id][
                secondaryIndex
              ].value
            );
          }
        } else if (control.controlType === "dropdown") {
          if (this.isThisFieldInLocationHeirarchies(control.id)) {
            this.dropdownApiCall(control);
            if (control.type === "string") {
              this.userForm.controls[`${control.id}`].setValue(
                this.user.request.demographicDetails.identity[`${control.id}`]
              );
              if (this.primaryLang !== this.secondaryLang) {
                this.transUserForm.controls[`${control.id}`].setValue(
                  this.user.request.demographicDetails.identity[`${control.id}`]
                );
              }
            } else if(control.type === 'simpleType') {
              this.userForm.controls[`${control.id}`].setValue(
                this.user.request.demographicDetails.identity[control.id][index]
                  .value
              );
              if (this.primaryLang !== this.secondaryLang) {
                this.transUserForm.controls[`${control.id}`].setValue(
                  this.user.request.demographicDetails.identity[control.id][
                    secondaryIndex
                  ].value
                );
              }
            }
          } else {
            this.userForm.controls[`${control.id}`].setValue(
              this.user.request.demographicDetails.identity[control.id][index]
                .value
            );
            if (this.primaryLang !== this.secondaryLang) {
              this.transUserForm.controls[`${control.id}`].setValue(
                this.user.request.demographicDetails.identity[control.id][
                  secondaryIndex
                ].value
              );
            }
          }
        }
      });
    }
  }
  /**
   * @description This will get the gender details from the master data.
   *
   * @private
   * @returns
   * @memberof DemographicComponent
   */
  private getGenderDetails() {
    return new Promise((resolve) => {
      this.subscriptions.push(
        this.dataStorageService.getGenderDetails().subscribe(
          (response) => {
            if (response[appConstants.RESPONSE]) {
              this.genders =
                response[appConstants.RESPONSE][
                  appConstants.DEMOGRAPHIC_RESPONSE_KEYS.genderTypes
                ];
              resolve(true);
            } else {
              this.onError(this.errorlabels.error, "");
            }
          },
          (error) => {
            this.loggerService.error("Unable to fetch gender");
            this.onError(this.errorlabels.error, error);
          }
        )
      );
    });
  }

  /**
   * @description This will get the residenceStatus
   * details from the master data.
   *
   * @private
   * @returns
   * @memberof DemographicComponent
   */
  private getResidentDetails() {
    return new Promise((resolve) => {
      this.subscriptions.push(
        this.dataStorageService.getResidentDetails().subscribe(
          (response) => {
            if (response[appConstants.RESPONSE]) {
              this.residenceStatus =
                response[appConstants.RESPONSE][
                  appConstants.DEMOGRAPHIC_RESPONSE_KEYS.residentTypes
                ];
              resolve(true);
            } else {
              this.onError(this.errorlabels.error, "");
            }
          },
          (error) => {
            this.loggerService.error("Unable to fetch Resident types");
            this.onError(this.errorlabels.error, error);
          }
        )
      );
    });
  }

  setDateOfBirth() {
    this.date = this.user.request.demographicDetails.identity[
      "dateOfBirth"
    ].split("/")[2];
    this.month = this.user.request.demographicDetails.identity[
      "dateOfBirth"
    ].split("/")[1];
    this.year = this.user.request.demographicDetails.identity[
      "dateOfBirth"
    ].split("/")[0];
    this.currentAge = this.calculateAge(
      this.user.request.demographicDetails.identity["dateOfBirth"]
    ).toString();

    this.userForm.controls[`dateOfBirth`].setValue(
      this.user.request.demographicDetails.identity["dateOfBirth"]
    );
    if (this.primaryLang !== this.secondaryLang) {
      this.transUserForm.controls[`dateOfBirth`].setValue(
        this.user.request.demographicDetails.identity["dateOfBirth"]
      );
    }
  }
  /**
   * @description This is called when age is changed and the date of birth will get calculated.
   *
   * @memberof DemographicComponent
   */
  onAgeChange() {
    this.defaultDay = this.config[
      appConstants.CONFIG_KEYS.mosip_default_dob_day
    ];
    this.defaultMonth = this.config[
      appConstants.CONFIG_KEYS.mosip_default_dob_month
    ];
    this.agePattern = this.config[
      appConstants.CONFIG_KEYS.mosip_id_validation_identity_age
    ];
    const ageRegex = new RegExp(this.agePattern);
    if (this.age.nativeElement.value) {
      if (ageRegex.test(this.age.nativeElement.value)) {
        this.currentAge = this.age.nativeElement.value;
        const now = new Date();
        const calulatedYear = now.getFullYear() - Number(this.currentAge);
        this.dd.nativeElement.value = this.defaultDay;
        this.mm.nativeElement.value = this.defaultMonth;
        this.yyyy.nativeElement.value = calulatedYear;
        this.date = this.defaultDay;
        this.month = this.defaultMonth;
        this.year = calulatedYear.toString();
        this.userForm.controls["dateOfBirth"].setValue(
          calulatedYear + "/" + this.defaultMonth + "/" + this.defaultDay
        );
        if (this.primaryLang !== this.secondaryLang) {
          this.transUserForm.controls["dateOfBirth"].setValue(
            calulatedYear + "/" + this.defaultMonth + "/" + this.defaultDay
          );
        }
        // this.userForm.controls["dateOfBirth"].setErrors(null);
        if (this.dataModification) {
          this.hasDobChanged();
        }
        console.log(this.userForm);
      } else {
        this.dd.nativeElement.value = "";
        this.mm.nativeElement.value = "";
        this.yyyy.nativeElement.value = "";
        this.date = "";
        this.month = "";
        this.year = "";
        this.userForm.controls["dateOfBirth"].markAsTouched();
        this.userForm.controls["dateOfBirth"].setErrors({
          incorrect: true,
        });
      }
    }
  }

  /**
   * @description This is called whenever there is a change in Date of birth field and accordingly age
   * will get calculate.
   *
   * @memberof DemographicComponent
   */
  onDOBChange() {
    this.date = this.dd.nativeElement.value;
    this.month = this.mm.nativeElement.value;
    this.year = this.yyyy.nativeElement.value;
    if (this.date !== "" && this.month !== "" && this.year !== "") {
      const newDate = this.year + "/" + this.month + "/" + this.date;
      console.log(newDate);
      if (moment(newDate,'YYYY/MM/DD',true).isValid()) {
        this.currentAge = this.calculateAge(newDate).toString();
        this.age.nativeElement.value = this.currentAge;
        this.userForm.controls["dateOfBirth"].setValue(newDate);
        if (this.primaryLang !== this.secondaryLang) {
          this.transUserForm.controls["dateOfBirth"].setValue(newDate);
        }
        if (this.dataModification) {
          this.hasDobChanged();
        }
      } else {
        this.userForm.controls["dateOfBirth"].markAsTouched();
        this.userForm.controls["dateOfBirth"].setErrors({
          incorrect: true,
        });
        this.currentAge = "";
        this.age.nativeElement.value = "";
      }
    }
  }

  /**
   * @description This method calculates the age for the given date.
   *
   * @param {Date} bDay
   * @returns
   * @memberof DemographicComponent
   */

  calculateAge(bDay) {
    const now = new Date();
    const born = new Date(bDay);
    const years = Math.floor(
      (now.getTime() - born.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    if (years > 150) {
      this.userForm.controls["dateOfBirth"].markAsTouched();
      this.userForm.controls["dateOfBirth"].setErrors({
        incorrect: true,
      });
      this.yyyy.nativeElement.value = "";
      this.date = "";
      this.month = "";
      this.year = "";
      return "";
    } else {
      return years;
    }
  }

  /**
   * @description This will filter the gender on the basis of langugae code.
   *
   * @private
   * @param {string} langCode
   * @param {*} [genderEntity=[]]
   * @param {*} entityArray
   * @memberof DemographicComponent
   */
  private filterOnLangCode(langCode: string, field: string, entityArray: any) {
    return new Promise((resolve, reject) => {
      if (entityArray) {
        //console.log(entityArray);
        entityArray.filter((element: any) => {
          //console.log(element);
          if (element.langCode === langCode) {
            let codeValue: CodeValueModal;
            if (element.genderName) {
              codeValue = {
                valueCode: element.code,
                valueName: element.genderName,
                languageCode: element.langCode,
              };
            } else if (element.name) {
              codeValue = {
                valueCode: element.code,
                valueName: element.name,
                languageCode: element.langCode,
              };
            } else {
              codeValue = {
                valueCode: element.code,
                valueName: element.value,
                languageCode: element.langCode,
              };
            }
            if (langCode === this.primaryLang) {
              this.primarydropDownFields[field].push(codeValue);
            } else {
              this.secondaryDropDownLables[field].push(codeValue);
            }
            resolve(true);
          }
        });
      }
    });
  }

  /**
   * @description This is to get the top most location Hierarchy, i.e. `Country Code`
   *
   * @returns
   * @memberof DemographicComponent
   */
  getLocationMetadataHirearchy() {
    return new Promise((resolve) => {
      const uppermostLocationHierarchy = this.dataStorageService.getLocationMetadataHirearchy();
      this.uppermostLocationHierarchy = uppermostLocationHierarchy;
      resolve(this.uppermostLocationHierarchy);
    });
  }

  /**
   * @description On click of back button the user will be navigate to dashboard.
   *
   * @memberof DemographicComponent
   */
  onBack() {
    let url = "";
    url = Utils.getURL(this.router.url, "dashboard", 2);
    this.router.navigate([url]);
  }

  /**
   * @description This method is to format the date event to yyyy/mm/dd format
   *
   * @param event date event
   */
  dateEvent(event) {
    const date = new Date(event.value);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    const datee = date.getDate();

    let monthOfYear = "";
    let dateOfMonth = "";
    if (month < 10) {
      monthOfYear = "0" + month;
    } else {
      monthOfYear = month.toString();
    }

    if (datee < 10) {
      dateOfMonth = "0" + datee;
    } else {
      dateOfMonth = datee.toString();
    }

    const formattedDate = `${year}/${monthOfYear}/${dateOfMonth}`;
    this.userForm.controls["dateOfBirth"].setValue(formattedDate);
    if(this.primaryLang !== this.secondaryLang){
      this.transUserForm.controls["dateOfBirth"].setValue(formattedDate);
    }
    if (this.dataModification) {
      this.hasDobChanged();
    }
  }

  /**
   * @description To mark a input as readonly or not
   *
   *
   * @param field Input control name
   */

  getReadOnlyfields(field: string) {
    const transliterate = [...appConstants.TRANSLITERATE_FIELDS];
    if (transliterate.includes(field)) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * @description This is used for the tranliteration.
   *
   * @param {FormControl} fromControl
   * @param {*} toControl
   * @memberof DemographicComponent
   */

  onTransliteration(fromControl: any, toControl: any) {
    if (this.userForm.controls[`${fromControl}`].value) {
      const request: any = {
        from_field_lang: this.primaryLang,
        from_field_value: this.userForm.controls[`${fromControl}`].value,
        to_field_lang: this.secondaryLang,
      };
      if (this.primaryLang === this.secondaryLang) {
        this.transUserForm.controls[toControl].patchValue(
          this.userForm.controls[`${fromControl}`].value
        );
        return;
      }

      this.subscriptions.push(
        this.dataStorageService.getTransliteration(request).subscribe(
          (response) => {
            if (response[appConstants.RESPONSE])
              this.transUserForm.controls[`${toControl}`].patchValue(
                response[appConstants.RESPONSE].to_field_value
              );
            else {
              this.onError(this.errorlabels.error, "");
            }
          },
          (error) => {
            this.onError(this.errorlabels.error, error);
            this.loggerService.error(error);
          }
        )
      );
    } else {
      this.transUserForm.controls[`${toControl}`].patchValue("");
    }
  }

  /**
   * @description This is a custom validator, which check for the white spaces.
   *
   * @private
   * @param {FormControl} control
   * @returns
   * @memberof DemographicComponent
   */
  private noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || "").trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  /**
   * @description This is called to submit the user form in case od modify or create.
   *
   * @memberof DemographicComponent
   */
  onSubmit() {
    this.uiFields.forEach((element) => {
      this.userForm.controls[`${element.id}`].markAsTouched();
      if(this.primaryLang !== this.secondaryLang){
        this.transUserForm.controls[`${element.id}`].markAsTouched();
      }
    });
    if (this.userForm.valid) {
      const identity = this.createIdentityJSONDynamic();
      const request = this.createRequestJSON(identity);
      //console.log(request);
      const responseJSON = this.createResponseJSON(identity);
      //console.log(responseJSON);
      this.dataUploadComplete = false;
      if (this.dataModification) {
        this.subscriptions.push(
          this.dataStorageService.updateUser(request, this.preRegId).subscribe(
            (response) => {
              if (
                (response[appConstants.NESTED_ERROR] === null &&
                  response[appConstants.RESPONSE] === null) ||
                response[appConstants.NESTED_ERROR] !== null
              ) {
                let message = "";
                if (
                  response[appConstants.NESTED_ERROR][0][
                    appConstants.ERROR_CODE
                  ] === appConstants.ERROR_CODES.invalidPin
                ) {
                  message = this.formValidation(response);
                } else message = this.errorlabels.error;
                this.onError(message, "");
                return;
              }
              this.onSubmission();
            },
            (error) => {
              this.loggerService.error(error);
              this.onError(this.errorlabels.error, error);
            }
          )
        );
      } else {
        this.subscriptions.push(
          this.dataStorageService.addUser(request).subscribe(
            (response) => {
              if (
                (response[appConstants.NESTED_ERROR] === null &&
                  response[appConstants.RESPONSE] === null) ||
                response[appConstants.NESTED_ERROR] !== null
              ) {
                this.loggerService.error(JSON.stringify(response));
                let message = "";
                if (
                  response[appConstants.NESTED_ERROR] &&
                  response[appConstants.NESTED_ERROR][0][
                    appConstants.ERROR_CODE
                  ] === appConstants.ERROR_CODES.invalidPin
                ) {
                  console.log(response);
                  message = this.formValidation(response);
                } else message = this.errorlabels.error;
                this.onError(message, "");
                return;
              } else {
                this.preRegId =
                  response[appConstants.RESPONSE].preRegistrationId;
              }
              this.onSubmission();
            },
            (error) => {
              this.loggerService.error(error);
              this.onError(this.errorlabels.error, error);
            }
          )
        );
      }
    }
  }

  formValidation(response: any) {
    const str = response[appConstants.NESTED_ERROR][0]["message"];
    const attr = str.substring(str.lastIndexOf("/") + 1);
    let message = this.errorlabels[attr];
    this.userForm.controls[attr].setErrors({
      incorrect: true,
    });
    return message;
  }

  /**
   * @description After sumission of the form, the user is route to file-upload or preview page.
   *
   * @memberof DemographicComponent
   */
  onSubmission() {
    this.canDeactivateFlag = false;
    this.checked = true;
    this.dataUploadComplete = true;
    let url = "";
    if (localStorage.getItem("modifyUserFromPreview") === "true") {
      url = Utils.getURL(this.router.url, "summary");
      localStorage.setItem("modifyUserFromPreview", "false");
      this.router.navigateByUrl(url + `/${this.preRegId}/preview`);
    } else {
      url = Utils.getURL(this.router.url, "file-upload");
      localStorage.removeItem("addingUserFromPreview");
      this.router.navigate([url, this.preRegId]);
    }
  }

  /**
   * @description THis is to create the attribute array for the Identity modal.
   *
   * @private
   * @param {string} element
   * @param {IdentityModel} identity
   * @memberof DemographicComponent
   */
  private createAttributeArray(element: string, identity) {
    let attr: any;
    if (typeof identity[element] === "object") {
      let forms = [];
      let formControlNames = "";
      const transliterateField = [...appConstants.TRANSLITERATE_FIELDS];
      if (transliterateField.includes(element)) {
        forms = ["userForm", "transUserForm"];
        formControlNames = element;
      } else {
        forms = ["userForm", "userForm"];
        formControlNames = element;
      }
      attr = [];
      for (let index = 0; index < this.languages.length; index++) {
        const languageCode = this.languages[index];
        const form = forms[index];
        const controlName = formControlNames;
        attr.push(
          new AttributeModel(
            languageCode,
            this[form].controls[`${controlName}`].value
          )
        );
      }
    } else if (typeof identity[element] === "string") {
      if (element === appConstants.IDSchemaVersionLabel) {
        attr = this.config[appConstants.CONFIG_KEYS.mosip_idschema_version];
      } else {
        attr = this.userForm.controls[`${element}`].value;
      }
    }
    identity[element] = attr;
  }

  /**
   * @description This method mark all the form control as touched
   *
   * @private
   * @param {FormGroup} formGroup
   * @memberof DemographicComponent
   */
  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * @description This is to create the identity modal
   *
   * @private
   * @returns
   * @memberof DemographicComponent
   */
  private createIdentityJSONDynamic() {
    const identityObj = { IDSchemaVersion: "" };
    this.identityData.forEach((field) => {
      if (
        field.inputRequired === true &&
        !(field.controlType === "fileupload")
      ) {
        if (!field.inputRequired) {
          identityObj[field.id] = "";
        } else {
          if (field.type === 'simpleType') {
            identityObj[field.id] = [];
          } else if (field.type === 'string'){
            identityObj[field.id] = "";
          }
        }
      }
    });

    let keyArr: any[] = Object.keys(identityObj);
    for (let index = 0; index < keyArr.length; index++) {
      const element = keyArr[index];
      this.createAttributeArray(element, identityObj);
    }
    const identityRequest = { identity: identityObj };
    return identityRequest;
  }

  /**
   * @description This is to create the request modal.
   *
   * @private
   * @param {IdentityModel} identity
   * @returns
   * @memberof DemographicComponent
   */
  private createRequestJSON(identity) {
    let langCode = this.primaryLang;
    if (this.user.request) {
      langCode = this.user.request.langCode;
    }
    const request = {
      langCode: langCode,
      demographicDetails: identity,
    };
    return request;
  }

  /**
   * @description This is the response modal.
   *
   * @private
   * @param {IdentityModel} identity
   * @returns
   * @memberof DemographicComponent
   */
  private createResponseJSON(identity) {
    let preRegistrationId = "";
    let createdBy = this.loginId;
    let createdDateTime = Utils.getCurrentDate();
    let updatedDateTime = "";
    let langCode = this.primaryLang;
    if (this.user.request) {
      preRegistrationId = this.preRegId;
      createdBy = this.user.request.createdBy;
      createdDateTime = this.user.request.createdDateTime;
      updatedDateTime = Utils.getCurrentDate();
      langCode = this.user.request.langCode;
    }
    const req = {
      preRegistrationId: this.preRegId,
      createdBy: createdBy,
      createdDateTime: createdDateTime,
      updatedDateTime: updatedDateTime,
      langCode: langCode,
      demographicDetails: identity,
    };
    return req;
  }

  hasDobChanged() {
    const currentDob = this.user.request.demographicDetails.identity
      .dateOfBirth;
    const changedDob = this.userForm.controls["dateOfBirth"].value;
    const currentDobYears = this.calculateAge(currentDob);
    const changedDobYears = this.calculateAge(changedDob);
    const ageToBeAdult = this.config[appConstants.CONFIG_KEYS.mosip_adult_age];
    if (this.showPreviewButton) {
      if (
        (currentDobYears < ageToBeAdult && changedDobYears < ageToBeAdult) ||
        (currentDobYears > ageToBeAdult && changedDobYears > ageToBeAdult)
      ) {
        this.showPreviewButton = true;
      } else {
        this.showPreviewButton = false;
        localStorage.setItem("modifyUserFromPreview", "false");
      }
    }
  }

  /**
   * @description This is a dialoug box whenever an erroe comes from the server, it will appear.
   *
   * @private
   * @memberof DemographicComponent
   */
  private onError(message: string, error: any) {
    this.dataUploadComplete = true;
    this.hasError = true;
    this.titleOnError = this.errorlabels.errorLabel;
    if (
      error &&
      error[appConstants.ERROR] &&
      error[appConstants.ERROR][appConstants.NESTED_ERROR] &&
      error[appConstants.ERROR][appConstants.NESTED_ERROR][0].errorCode ===
        appConstants.ERROR_CODES.tokenExpired
    ) {
      message = this.errorlabels.tokenExpiredLogout;
      this.titleOnError = "";
    }
    const body = {
      case: "ERROR",
      title: this.titleOnError,
      message: message,
      yesButtonText: this.errorlabels.button_ok,
    };
    this.dialog.open(DialougComponent, {
      width: "250px",
      data: body,
    });
  }

  /**
   * @description This method is called to open a virtual keyvboard in the specified languaged.
   *
   * @param {string} formControlName
   * @param {number} index
   * @memberof DemographicComponent
   */
  onKeyboardDisplay(formControlName: string, index: number) {
    let control: AbstractControl;
    let lang: string;
    if (this.userForm.controls[formControlName]) {
      control = this.userForm.controls[formControlName];
      lang = appConstants.virtual_keyboard_languages[this.primaryLang];
    } else {
      control = this.transUserForm.controls[formControlName];
      lang = appConstants.virtual_keyboard_languages[this.secondaryLang];
    }
    if (this.oldKeyBoardIndex == index && this.matKeyboardService.isOpened) {
      this.matKeyboardService.dismiss();
    } else {
      let el: ElementRef;
      this.oldKeyBoardIndex = index;
      el = this._attachToElementMesOne._results[index];
      el.nativeElement.focus();
      this._keyboardRef = this.matKeyboardService.open(lang);
      this._keyboardRef.instance.setInputInstance(el);
      this._keyboardRef.instance.attachControl(control);
    }
  }

  scrollUp(ele: HTMLElement) {
    ele.scrollIntoView({ behavior: "smooth" });
  }

  @HostListener("blur", ["$event"])
  @HostListener("focusout", ["$event"])
  private _hideKeyboard() {
    if (this.matKeyboardService.isOpened) {
      this.matKeyboardService.dismiss();
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
