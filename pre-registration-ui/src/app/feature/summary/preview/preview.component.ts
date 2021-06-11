import { Component, OnInit } from "@angular/core";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { Router, ActivatedRoute } from "@angular/router";
import { UserModel } from "src/app/shared/models/demographic-model/user.modal";
import { RegistrationService } from "src/app/core/services/registration.service";
import { TranslateService } from "@ngx-translate/core";
import Utils from "src/app/app.util";
import * as appConstants from "../../../app.constants";
import { ConfigService } from "src/app/core/services/config.service";
import { CodeValueModal } from "src/app/shared/models/demographic-model/code.value.modal";
import { LocDetailModal } from "src/app/shared/models/loc.detail.modal";

@Component({
  selector: "app-preview",
  templateUrl: "./preview.component.html",
  styleUrls: ["./preview.component.css"],
})
export class PreviewComponent implements OnInit {
  previewData: any;
  Language;
  user: UserModel;
  preRegId: string;
  files: any;
  documentTypes = [];
  documentMapObject = [];
  sameAs = "";
  residenceStatus: any;
  genders: any;

  identityData = [];
  uiFields = [];
  locationHeirarchy = [];
  locationHeirarchies = [];
  dynamicFields = [];
  dropDownFields = {};
  dataCaptureLanguages = [];
  controlIds = [];
  ControlIdLabelObjects = {};
  readOnlyMode=false;
  constructor(
    private dataStorageService: DataStorageService,
    private router: Router,
    private registrationService: RegistrationService,
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private configService: ConfigService
  ) {
    this.translate.use(localStorage.getItem("langCode"));
    localStorage.setItem("modifyDocument", "false");
  }

  async ngOnInit() {
    let self = this;
    this.activatedRoute.params.subscribe((param) => {
      this.preRegId = param["appId"];
    });
    await this.getIdentityJsonFormat();
    // await this.getResidentDetails();
    // await this.getGenderDetails();
    await this.setDynamicFieldValues();
    await this.getUserInfo();
    await this.getUserFiles();
    await this.getDocumentCategories();
    this.previewData = this.user.request.demographicDetails.identity;
    const identityObj = this.user.request.demographicDetails.identity;
    if (identityObj) {
      let keyArr: any[] = Object.keys(identityObj);
      for (let index = 0; index < keyArr.length; index++) {
        const elementKey = keyArr[index];
        let dataArr = identityObj[elementKey];
        if (Array.isArray(dataArr)) {
          dataArr.forEach((dataArrElement) => {
            if (!this.dataCaptureLanguages.includes(dataArrElement.language)) {
              this.dataCaptureLanguages.push(dataArrElement.language);
            }
          });
        }
      }
    } else if (this.user.request.langCode) {
      this.dataCaptureLanguages = [this.user.request.langCode];
    }

    this.calculateAge();
    this.formatDob(this.previewData.dateOfBirth);
    this.getLanguageLabels();
    this.files = this.user.files ? this.user.files : [];
    this.documentsMapping();
    //remove blank fields
    let updatedUIFields = [],
      tempObj = {};
    this.uiFields.forEach((control) => {
      if (this.previewData[control.id]) {
        self.controlIds.push(control.id);
        self.dataCaptureLanguages.forEach((langCode) => {
          tempObj[langCode] = control.labelName[langCode];
        });
        self.ControlIdLabelObjects[control.id] = tempObj;
        tempObj = {};
        updatedUIFields.push(control);
      }
    });
    let locations = [];
    this.locationHeirarchies.forEach((element) => {
      locations.push(...element);
    });
    let locName = "",
      label = "";
    for (let i = 0; i < self.controlIds.length; i++) {
      label = self.controlIds[i];
      updatedUIFields.forEach((control) => {
        if (control.id === label && control.fieldType === "dynamic") {
          this.previewData[label].forEach((ele) => {
            this.dropDownFields[label].forEach((codeValue) => {
              if (
                ele.language === codeValue.languageCode &&
                ele.value === codeValue.valueCode
              ) {
                ele.value = codeValue.valueName;
                console.log(codeValue.valueName);
              }
            });
          });
        }
      });
      if (locations.includes(label)) {
        for (let j = 0; j < self.previewData[label].length; j++) {
          self.fetchLocationName(
            self.previewData[label][j].value,
            self.previewData[label][j].language,
            j,
            label
          );
        }
      }
    }
  }

  checkArray(data, control) {
    let result = false;
    //if (controlId.type == "string")
    if (Array.isArray(data)) {
      result = true;
    }
    return result;
  }

  async getIdentityJsonFormat() {
    return new Promise((resolve, reject) => {
      this.dataStorageService.getIdentityJson().subscribe((response) => {
        //console.log(response);
        let identityJsonSpec = response[appConstants.RESPONSE]["jsonSpec"]["identity"];
        //console.log(jsonSpec)
        this.identityData = identityJsonSpec["identity"];
        let locationHeirarchiesFromJson = [
          ...identityJsonSpec["locationHierarchy"],
        ];
        if (Array.isArray(locationHeirarchiesFromJson[0])) {
          this.locationHeirarchies = locationHeirarchiesFromJson;
        } else {
          let hierarchiesArray = [];
          hierarchiesArray.push(locationHeirarchiesFromJson);
          this.locationHeirarchies = hierarchiesArray;
        }
        this.locationHeirarchy = this.locationHeirarchies[0];
        
        console.log(...this.locationHeirarchies);
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
            fields.fieldType === "dynamic"
        );
        this.getIntialDropDownArrays();
        resolve(true);
      });
    });
  }

  getIntialDropDownArrays() {
    this.uiFields.forEach((control) => {
      if (control.controlType === "dropdown" || control.controlType === "button") {
        this.dropDownFields[control.id] = [];
      }
    });
  }

  private filterOnLangCode(langCode: string, field: string, entityArray: any) {
    return new Promise((resolve, reject) => {
      if (entityArray) {
        entityArray.filter((element: any) => {
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
                languageCode: langCode,
              };
            }
            this.dropDownFields[field].push(codeValue);
            resolve(true);
          }
        });
      }
    });
  }

  getUserInfo() {
    return new Promise((resolve) => {
      this.dataStorageService
        .getUser(this.preRegId.toString())
        .subscribe((response) => {
          this.user = new UserModel(
            this.preRegId.toString(),
            response[appConstants.RESPONSE],
            undefined,
            []
          );
          let resp = response[appConstants.RESPONSE];
          if (resp["statusCode"] !== appConstants.APPLICATION_STATUS_CODES.incomplete &&
            resp["statusCode"] !== appConstants.APPLICATION_STATUS_CODES.pending) {
            this.readOnlyMode = true;
          } else {
            this.readOnlyMode = false;
          }
          resolve(true);
        });
    });
  }

  getUserFiles() {
    return new Promise((resolve) => {
      this.dataStorageService
        .getUserDocuments(this.preRegId)
        .subscribe((response) => {
          this.setUserFiles(response);
          resolve(true);
        });
    });
  }

  setUserFiles(response) {
    if (!response["errors"]) {
      this.user.files = response[appConstants.RESPONSE][appConstants.METADATA];
    }
  }

  getDocumentCategories() {
    const applicantcode = localStorage.getItem("applicantType");
    return new Promise((resolve) => {
      this.dataStorageService
        .getDocumentCategories(applicantcode)
        .subscribe((response) => {
          this.documentTypes =
            response[appConstants.RESPONSE].documentCategories;
          resolve(true);
        });
    });
  }

  formatDob(dob: string) {
    dob = dob.replace(/\//g, "-");
    this.previewData.dateOfBirth = Utils.getBookingDateTime(
      dob,
      "",
      localStorage.getItem("langCode")
    );
  }

  documentsMapping() {
    this.documentMapObject = [];
    if (this.files && this.documentTypes.length !== 0) {
      this.documentTypes.forEach((type) => {
        const file = this.files.filter((file) => file.docCatCode === type.code);
        if (
          type.code === "POA" &&
          file.length === 0 &&
          this.registrationService.getSameAs() !== ""
        ) {
          const obj = {
            docName: this.sameAs,
          };
          file.push(obj);
        }
        const obj = {
          code: type.code,
          name: type.description,
          fileName: file.length > 0 ? file[0].docName : undefined,
        };
        this.documentMapObject.push(obj);
      });
    }
  }

  private async setDynamicFieldValues() {
    await this.getDynamicFieldValues(null);
  }

  getDynamicFieldValues(pageNo) {
    let pageNumber;
    if (pageNo == null) {
      pageNumber = 0;
    } else {
      pageNumber = pageNo;
    }
    return new Promise((resolve) => {
      this.dataStorageService
        .getDynamicFieldsandValuesForAllLang(pageNumber)
        .subscribe((response) => {
          let dynamicField = response[appConstants.RESPONSE]["data"];
          this.dynamicFields.forEach((field) => {
            dynamicField.forEach((res) => {
              if (field.id === res.name) {
                this.filterOnLangCode(
                  res["langCode"],
                  res.name,
                  res["fieldVal"]
                );
              }
            });
          });
          let totalPages = response[appConstants.RESPONSE]["totalPages"];
          if (totalPages) {
            totalPages = Number(totalPages);
          }
          pageNumber = pageNumber + 1;
          if (totalPages > pageNumber) {
            this.getDynamicFieldValues(pageNumber);
          }
        });
      resolve(true);
    });
  }

  getLanguageLabels() {
    this.dataStorageService
      .getI18NLanguageFiles(localStorage.getItem("langCode"))
      .subscribe((response) => {
        this.sameAs = response["sameAs"];
      });
  }

  calculateAge() {
    const now = new Date();
    const born = new Date(this.previewData.dateOfBirth);
    const years = Math.floor(
      (now.getTime() - born.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    this.previewData.age = years;
  }

  modifyDemographic() {
    const url = Utils.getURL(this.router.url, "demographic", 3);
    localStorage.setItem("modifyUserFromPreview", "true");
    localStorage.setItem("modifyUser", "true");
    this.router.navigateByUrl(url + `/${this.preRegId}`);
  }

  modifyDocument() {
    localStorage.setItem("modifyDocument", "true");
    this.navigateBack();
  }

  private getGenderDetails() {
    return new Promise((resolve) => {
      this.dataStorageService.getGenderDetails().subscribe((response) => {
        if (response[appConstants.RESPONSE]) {
          this.genders =
            response[appConstants.RESPONSE][
              appConstants.DEMOGRAPHIC_RESPONSE_KEYS.genderTypes
            ];
          resolve(true);
        }
      });
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
      this.dataStorageService.getResidentDetails().subscribe((response) => {
        if (response[appConstants.RESPONSE]) {
          this.residenceStatus =
            response[appConstants.RESPONSE][
              appConstants.DEMOGRAPHIC_RESPONSE_KEYS.residentTypes
            ];
          resolve(true);
        }
      });
    });
  }

  enableContinue(): boolean {
    let flag = true;
    this.documentMapObject.forEach((object) => {
      if (object.fileName === undefined) {
        if (
          object.code === "POA" &&
          this.registrationService.getSameAs() !== ""
        ) {
          flag = true;
        } else {
          flag = false;
        }
      }
    });
    return flag;
  }

  private fetchLocationName(
    locCode: string,
    langCode: string,
    index: number,
    controlName: string
  ) {
    let self = this;
    return new Promise((resolve) => {
      this.dataStorageService
        .getLocationInfoForLocCode(locCode, langCode)
        .subscribe((response) => {
          if (response[appConstants.RESPONSE]) {
            self.previewData[controlName][index]["label"] =
              response[appConstants.RESPONSE]["name"];
          }
        });
    });
  }

  navigateDashboard() {
    localStorage.setItem("newApplicant", "true");
    localStorage.setItem("modifyUserFromPreview", "false");
    localStorage.setItem("modifyUser", "false");
    localStorage.setItem("addingUserFromPreview", "true");
    this.router.navigate([`${this.Language}/pre-registration/demographic/new`]);
  }

  navigateBack() {
    const url = Utils.getURL(this.router.url, "file-upload", 3);
    this.router.navigateByUrl(url + `/${this.preRegId}`);
  }

  navigateNext() {
    let url = Utils.getURL(this.router.url, "booking", 3);
    url = url + `/${this.preRegId}/pick-center`;
    this.router.navigateByUrl(url);
  }
}
