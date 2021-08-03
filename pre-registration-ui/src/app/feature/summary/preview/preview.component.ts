import { Component, OnInit } from "@angular/core";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { Router, ActivatedRoute } from "@angular/router";
import { UserModel } from "src/app/shared/models/demographic-model/user.modal";
import { RegistrationService } from "src/app/core/services/registration.service";
import { TranslateService } from "@ngx-translate/core";
import Utils from "src/app/app.util";
import * as appConstants from "../../../app.constants";
import LanguageFactory from "src/assets/i18n";
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
  secondaryLanguagelabels: any;
  primaryLanguage;
  secondaryLanguage;
  dateOfBirthPrimary: string = "";
  dateOfBirthSecondary: string = "";
  user: UserModel;
  preRegId: string;
  files: any;
  documentTypes = [];
  documentMapObject = [];
  sameAs = "";
  residentTypeMapping = {
    primary: {},
    secondary: {},
  };
  primaryLocations;
  secondaryLocations;
  residenceStatus: any;
  genders: any;

  identityData = [];
  uiFields = [];
  locationHeirarchy = [];
  locationHeirarchies = [];
  primaryLangLocInfo = [];
  secondaryLangLocInfo = [];
  dynamicFields = [];
  primarydropDownFields = {};
  secondaryDropDownFields = {};
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
    this.primaryLanguage = localStorage.getItem("langCode");
    this.secondaryLanguage = localStorage.getItem("secondaryLangCode");
    this.activatedRoute.params.subscribe((param) => {
      this.preRegId = param["appId"];
    });
    await this.getIdentityJsonFormat();
    // await this.getResidentDetails();
    // await this.getGenderDetails();
    await this.getUserInfo();
//     await this.convertLocationCodeToLocationName();
    await this.getUserFiles();
    await this.getDocumentCategories();
    this.previewData = this.user.request.demographicDetails.identity;
    //console.log("previewData");
    //console.log(this.previewData);
    this.calculateAge();
    //this.previewData.primaryAddress = this.combineAddress(0);
    //this.previewData.secondaryAddress = this.combineAddress(1);
    this.formatDob(this.previewData.dateOfBirth);
    this.getSecondaryLanguageLabels();
    this.files = this.user.files ? this.user.files : [];
    this.documentsMapping();
    //remove blank fields
    let updatedUIFields = [];
    this.uiFields.forEach((control) => {
      if (this.previewData[control.id]) {
        updatedUIFields.push(control);
      }
    });
    this.uiFields = updatedUIFields;
    //console.log("populateLocationInfoArray");
    await this.populateLocationInfoArray();
    //console.log(this.primaryLangLocInfo);
    //console.log(this.secondaryLangLocInfo);
  }

  async getIdentityJsonFormat() {
    return new Promise((resolve, reject) => {
      this.dataStorageService.getIdentityJson().subscribe(async (response) => {
        console.log(response);
        this.identityData = response["response"]["idSchema"]["identity"];
        this.locationHeirarchy = [
          ...response["response"]["idSchema"]["locationHierarchy"],
        ];
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
        await this.setDynamicFieldValues();
        resolve(true);
      });
    });
  }

  getIntialDropDownArrays() {
    this.uiFields.forEach((control) => {
      if (control.controlType === "dropdown" || control.controlType === "button") {
        this.primarydropDownFields[control.id] = [];
        if (this.primaryLanguage != this.secondaryLanguage) {
          this.secondaryDropDownFields[control.id] = [];
        }
      }
    });
  }

  private async setDynamicFieldValues() {
    await this.getDynamicFieldValues(null);
  }
  async getDynamicFieldValues(pageNo) {
    let pageNumber;
    if (pageNo == null) {
      pageNumber = 0;
    } else {
      pageNumber = pageNo;
    }
    return new Promise((resolve) => {
      this.dataStorageService
        .getDynamicFieldsandValuesForAllLang(pageNumber)
        .subscribe(async (response) => {
          let dynamicField = response[appConstants.RESPONSE]["data"];
          this.dynamicFields.forEach((field) => {
            dynamicField.forEach(async (res) => {
              if (field.id === res.name && res.langCode === this.primaryLanguage) {
                await this.filterOnLangCode(
                  this.primaryLanguage,
                  res.name,
                  res["fieldVal"]
                );
              }
              if (
                field.id === res.name &&
                this.primaryLanguage !== this.secondaryLanguage && 
                res.langCode === this.secondaryLanguage
              ) {
                await this.filterOnLangCode(
                  this.secondaryLanguage,
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
            await this.getDynamicFieldValues(pageNumber);
            resolve(true);
          } else {
            resolve(true);
          }
        });
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
                languageCode: element.langCode,
              };
            }
            if (langCode === this.primaryLanguage) {
              this.primarydropDownFields[field].push(codeValue);
            } else {
              this.secondaryDropDownFields[field].push(codeValue);
            }
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

//   convertLocationCodeToLocationName() {
//     this.locationHeirarchy.forEach((location) => {
//       this.getLocations(
//         this.user.request.demographicDetails.identity[location][0].value,
//         this.primaryLanguage
//       ).then(
//         (val) =>
//           (this.user.request.demographicDetails.identity[
//             location
//           ][0].value = val)
//       );
//       if (this.primaryLanguage != this.secondaryLanguage) {
//         this.getLocations(
//           this.user.request.demographicDetails.identity[location][1].value,
//           this.secondaryLanguage
//         ).then((val) => (val) =>
//           (this.user.request.demographicDetails.identity[
//             location
//           ][0].value = val)
//         );
//       }
//     });
//   }

  formatDob(dob: string) {
    dob = dob.replace(/\//g, "-");
    this.dateOfBirthPrimary = Utils.getBookingDateTime(
      dob,
      "",
      localStorage.getItem("langCode")
    );
    this.dateOfBirthSecondary = Utils.getBookingDateTime(
      dob,
      "",
      localStorage.getItem("secondaryLangCode")
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

  combineAddress(index: number) {
    const address =
      this.previewData.addressLine1[index].value +
      (this.previewData.addressLine2[index].value
        ? ", " + this.previewData.addressLine2[index].value
        : "") +
      (this.previewData.addressLine3[index].value
        ? ", " + this.previewData.addressLine3[index].value
        : "");
    return address;
  }

  getSecondaryLanguageLabels() {
    let factory = new LanguageFactory(
      localStorage.getItem("secondaryLangCode")
    );
    let response = factory.getCurrentlanguage();
    this.secondaryLanguagelabels = response["preview"];
    this.residentTypeMapping.secondary = response["residentTypesMapping"];
  }

  getPrimaryLanguageData() {
    let factory = new LanguageFactory(localStorage.getItem("langCode"));
    let response = factory.getCurrentlanguage();
    this.sameAs = response["sameAs"];
    this.residentTypeMapping.primary = response["residentTypesMapping"];
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

  getLocations(locationCode, langCode) {
    return new Promise((resolve) => {
      this.dataStorageService
        .getLocationsHierarchyByLangCode(langCode, locationCode)
        .subscribe((response) => {
          if (response[appConstants.RESPONSE]) {
            const locations =
              response[appConstants.RESPONSE]["locations"][0]["name"];
            resolve(locations);
          }
        });
    });
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
  // async locationData() {
  //   await this.getLocations(localStorage.getItem("langCode")).then(
  //     (value) => (this.primaryLocations = value)
  //   );
  //   this.getLocations(localStorage.getItem("secondaryLangCode")).then(
  //     (value) => (this.secondaryLocations = value)
  //   );
  // }

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

  isThisFieldInLocationHeirarchies = (fieldId) => {
    let items = this.getLocationHierarchy(fieldId);
    return items.length > 0 ? true: false;
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

  populateLocationInfoArray = async () => {
    for await (const control of this.uiFields) {
      if (control.controlType === "dropdown" && this.isThisFieldInLocationHeirarchies(control.id) 
      && control.type === 'simpleType') {
        const locCode = this.previewData[control.id][0].value;
        if (locCode) {
          let langCode = this.primaryLanguage;
          await this.fetchLocationName(locCode, langCode );
          if (this.primaryLanguage != this.secondaryLanguage) {
            langCode = this.secondaryLanguage;
            await this.fetchLocationName(locCode, langCode );
          }  
        }    
      }
    }    
  }
  
  getLocationName = (locCode: string, langCode: string) => {
    if (langCode == this.primaryLanguage && this.primaryLangLocInfo) {
      let filteredArr = this.primaryLangLocInfo.filter(locInfo => locInfo.locCode == locCode && locInfo.langCode == langCode);
      if (filteredArr.length > 0) {
        return filteredArr[0].locName;
      }   
    }
    else if (langCode == this.secondaryLanguage && this.secondaryLangLocInfo && this.primaryLanguage != this.secondaryLanguage) {
      let filteredArr = this.secondaryLangLocInfo.filter(locInfo => locInfo.locCode == locCode && locInfo.langCode == langCode);
      if (filteredArr.length > 0) {
        return filteredArr[0].locName;
      }   
    }
  }

  fetchLocationName = async (locCode: string, langCode: string) => {
    await this.dataStorageService.getLocationInfoForLocCode(locCode, langCode).subscribe((response) => {
      if (response[appConstants.RESPONSE]) {
        let locName =
          response[appConstants.RESPONSE][
            "name"
          ];
          let obj : LocDetailModal = {
            locCode: locCode,
            langCode: langCode,
            locName: locName
          }
          if (langCode == this.primaryLanguage) {
            this.primaryLangLocInfo.push(obj);
          }
          else if (langCode == this.secondaryLanguage) {
            this.secondaryLangLocInfo.push(obj);
          }  
      }
    });
  }

  navigateDashboard() {
    localStorage.setItem("newApplicant", "true");
    localStorage.setItem("modifyUserFromPreview", "false");
    localStorage.setItem("modifyUser", "false");
    localStorage.setItem("addingUserFromPreview", "true");
    this.router.navigate([
      `${this.primaryLanguage}/pre-registration/demographic/new`,
    ]);
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
