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
    this.locationData();
    await this.getResidentDetails();
    await this.getGenderDetails();
    await this.getUserInfo();
    await this.getUserFiles();
    await this.getDocumentCategories();
    this.previewData = this.user.request.demographicDetails.identity;
    this.calculateAge();
    this.previewData.primaryAddress = this.combineAddress(0);
    this.previewData.secondaryAddress = this.combineAddress(1);
    this.formatDob(this.previewData.dateOfBirth);
    this.setFieldValues();
    this.getSecondaryLanguageLabels();
    this.files = this.user.files ? this.user.files : [];
    this.documentsMapping();
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

  setFieldValues() {
    let fields = appConstants.previewFields;
    fields.forEach((field) => {
      this.previewData[field].forEach((element) => {
        if(!(field === appConstants.controlTypeResidenceStatus || field === appConstants.controlTypeGender)){
          element.name = this.locCodeToName(element.value, element.language);
        }
        else if(field === appConstants.controlTypeResidenceStatus){
            this.residenceStatus.forEach(status => {
            if(status.code === element.value && element.language === status.langCode){
              element.name = status.name;
            }
          });
        }
        else if(field === appConstants.controlTypeGender){
          this.genders.filter(gender => {
            if(gender.code === element.value && element.language === gender.langCode){
              element.name = gender.genderName;
            }
          });
        }
      });
    });
    
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
    localStorage.setItem('modifyUser','true');
    this.router.navigateByUrl(url + `/${this.preRegId}`);
  }

  modifyDocument() {
    localStorage.setItem("modifyDocument", "true");
    this.navigateBack();
  }

  private locCodeToName(locationCode: string, language: string): string {
    let locationName = "";
    if (language === localStorage.getItem("langCode")) {
      this.primaryLocations.forEach((loc) => {
        if (loc.code === locationCode) {
          locationName = loc.name;
        }
      });
    } else {
      this.secondaryLocations.forEach((loc) => {
        if (loc.code === locationCode) {
          locationName = loc.name;
        }
      });
    }
    return locationName;
  }

  private getLocations(langCode) {
    return new Promise((resolve) => {
      const countryCode = this.configService.getConfigByKey(
        appConstants.CONFIG_KEYS.mosip_country_code
      );
      this.dataStorageService
        .getLocationsHierarchyByLangCode(langCode, countryCode)
        .subscribe((response) => {
          if (response[appConstants.RESPONSE]) {
            const locations = response[appConstants.RESPONSE].locations;
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
  async locationData() {
    await this.getLocations(localStorage.getItem("langCode")).then(
      (value) => (this.primaryLocations = value)
    );
    this.getLocations(localStorage.getItem("secondaryLangCode")).then(
      (value) => (this.secondaryLocations = value)
    );
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

  navigateDashboard() {
    localStorage.setItem("newApplicant", "true");
    localStorage.setItem("modifyUserFromPreview", "false");
    localStorage.setItem('modifyUser','false');
    localStorage.setItem('addingUserFromPreview','true');
    this.router.navigate([`${this.primaryLanguage}/pre-registration/demographic/new`]);
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
