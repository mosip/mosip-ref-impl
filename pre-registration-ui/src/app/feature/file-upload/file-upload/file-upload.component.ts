import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import * as appConstants from "../../../app.constants";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ViewChild } from "@angular/core";
import { FileModel } from "src/app/shared/models/demographic-model/file.model";
import { UserModel } from "src/app/shared/models/demographic-model/user.modal";
import { RegistrationService } from "src/app/core/services/registration.service";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { TranslateService } from "@ngx-translate/core";
import { BookingService } from "../../booking/booking.service";
import { RequestModel } from "src/app/shared/models/request-model/RequestModel";
import { ConfigService } from "src/app/core/services/config.service";
import { DialougComponent } from "src/app/shared/dialoug/dialoug.component";
import { MatDialog } from "@angular/material";
import { FilesModel } from "src/app/shared/models/demographic-model/files.model";
import { LogService } from "src/app/shared/logger/log.service";
import Utils from "src/app/app.util";
import { Subscription } from "rxjs";
import identityStubJson from "../../../../assets/identity-spec.json";

@Component({
  selector: "app-file-upload",
  templateUrl: "./file-upload.component.html",
  styleUrls: ["./file-upload.component.css"],
})
export class FileUploadComponent implements OnInit, OnDestroy {
  textDir = localStorage.getItem("dir");
  selected = [];
  @ViewChild("fileUpload")
  fileInputVariable: ElementRef;
  fileDocCatCode = "";
  sortedUserFiles: any[] = [];
  applicantType: string;
  allowedFilesHtml: string = "";
  allowedFileSize: string = "";
  sameAsselected: boolean = false;
  isModify: any;
  fileName: string = "";
  fileByteArray;
  fileUrl: SafeResourceUrl;
  applicantPreRegId: string;
  file: FileModel = new FileModel();
  userFile: FileModel[] = [this.file];
  userFiles: FilesModel = new FilesModel(this.userFile);
  formData = new FormData();
  user: UserModel = new UserModel();
  users: UserModel[] = [];
  enableBrowseButtonList = [];
  activeUsers: UserModel[] = [];
  documentCategory: string;
  documentType: string;
  loginId: string;
  documentIndex: number;
  selectedDocument: SelectedDocuments = {
    docCatCode: "",
    docTypeCode: "",
  };
  selectedDocuments: SelectedDocuments[] = [];

  LOD: DocumentCategory[] = [];
  fileIndex: number = -1;
  fileUploadLanguagelabels: any;
  errorlabels: any;
  fileExtension: string = "pdf";
  sameAs: string;
  disableNavigation: boolean = false;
  start: boolean = false;
  browseDisabled: boolean = true;
  documentName: string;
  flag: boolean;
  zoom: number = 0.5;
  userPrefLanguage = localStorage.getItem("userPrefLanguage");
  userPrefLanguageIsLtr = false;
  userForm = new FormGroup({});
  validationMessage: any;
  documentUploadRequestBody: DocumentUploadRequestDTO = {
    docCatCode: "",
    docTypCode: "",
    langCode: "",
    docRefId: "",
  };
  files: FilesModel;
  documentCategoryDto: DocumentCategoryDTO = {
    attribute: "",
    value: "",
  };
  documentCategoryrequestDto: DocumentCategoryDTO[];
  documentRequest: RequestModel;
  step: number = 0;
  multipleApplicants: boolean = false;
  allApplicants: any[] = [];
  applicants: any[] = [];
  allowedFiles: string[];
  firstFile: Boolean = true;
  subscriptions: Subscription[] = [];
  identityData = [];
  uiFields = [];
  preRegId: number;
  isDocUploadRequired = [];
  name: "";
  readOnlyMode = false;
  dataLoaded = false;
  constructor(
    private registration: RegistrationService,
    private dataStorageService: DataStorageService,
    private router: Router,
    private config: ConfigService,
    public domSanitizer: DomSanitizer,
    private bookingService: BookingService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private loggerService: LogService,
    private activatedRoute: ActivatedRoute
  ) {
    this.initiateComponent();
    let ltrLangs = this.config
      .getConfigByKey(appConstants.CONFIG_KEYS.mosip_left_to_right_orientation)
      .split(",");
    if (ltrLangs.includes(this.userPrefLanguage)) {
      this.userPrefLanguageIsLtr = true;
    } else {
      this.userPrefLanguageIsLtr = false;
    }
    
  }

  async ngOnInit() {
    
    this.getFileSize();
    this.getPrimaryLabels();
    this.allowedFiles = this.config
      .getConfigByKey(
        appConstants.CONFIG_KEYS.preregistration_document_alllowe_files
      )
      .split(",");
    this.getAllowedFileTypes(this.allowedFiles);
    this.loginId = localStorage.getItem("loginId");
    await this.getAllApplicants();
    this.sameAs = this.registration.getSameAs();
    if (this.sameAs === "") {
      this.sameAsselected = false;
    } else {
      this.sameAsselected = true;
    }
    this.dataStorageService
      .getI18NLanguageFiles(this.userPrefLanguage)
      .subscribe((response) => {
        if (response["message"])
          this.fileUploadLanguagelabels = response["message"];
        if (response["error"]) this.errorlabels = response["error"];
      });
    this.name = this.config.getConfigByKey(
      appConstants.CONFIG_KEYS.preregistartion_identity_name
    );
    if (this.readOnlyMode) {
      this.userForm.disable();
    }
    
  }

  async getIdentityJsonFormat() {
    return new Promise((resolve) => {
      this.dataStorageService.getIdentityJson().subscribe((response) => {
        //response = identityStubJson;
        let identityJsonSpec =
          response[appConstants.RESPONSE]["jsonSpec"]["identity"];
        this.identityData = identityJsonSpec["identity"];
        this.identityData.forEach((obj) => {
          if (obj.controlType === "fileupload") {
            this.uiFields.push(obj);
          }
        });
        resolve(true);
      });
    });
  }

  private getPrimaryLabels() {}

  /**
   *@description This method initialises the users array and the language set by the user.
   *@private
   * @memberof FileUploadComponent
   */
  private async initiateComponent() {
    await this.getIdentityJsonFormat();
    this.translate.use(this.userPrefLanguage);
    this.isModify = localStorage.getItem("modifyDocument");
    this.activatedRoute.params.subscribe((param) => {
      this.preRegId = param["appId"];
    });
    if (this.preRegId) {
      await this.getUserInfo();
      await this.getUserFiles();
      if (!this.users[0].files) {
        this.users[0].files = this.userFiles;
      }
      await this.getApplicantTypeID();
      //check if all required documents have been uploaded
      this.uiFields.forEach((control) => {
        const controlId = control.id;
        if (this.userForm.controls[`${controlId}`]) {
          this.userForm.controls[`${controlId}`].markAsTouched();
        }
      });
      //if yes, and if application status is "Application_Incomplete",
      //then update it to "Pending_Appointment"
      if (this.userForm.valid) {
        await this.updateApplicationStatus();
      } 
      //Mark all form fields are untouched to prevent errors before Submit. 
      this.uiFields.forEach((control) => {
        const controlId = control.id;
        if (this.userForm.controls[`${controlId}`]) {
          this.userForm.controls[`${controlId}`].markAsUntouched();
        }
      });
      this.dataLoaded = true;
    } else {
      if (!this.users[0].files) {
        this.users[0].files = this.userFiles;
      }
      this.loggerService.info("active users", this.activeUsers);
    }
  }

  getUserInfo() {
    return new Promise((resolve) => {
      this.dataStorageService
        .getUser(this.preRegId.toString())
        .subscribe((response) => {
          this.users.push(
            new UserModel(
              this.preRegId.toString(),
              response[appConstants.RESPONSE],
              undefined,
              undefined
            )
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
      this.userFile = response[appConstants.RESPONSE][appConstants.METADATA];
    } else {
      let fileModel: FileModel = new FileModel("", "", "", "", "", "", "", "");
      if (this.userFile.length === 0) {
        this.userFile.push(fileModel);
      }
    }
    this.userFiles["documentsMetaData"] = this.userFile;
  }
  onModification() {
    if (
      this.users[0].files &&
      this.users[0].files.documentsMetaData[0].docCatCode &&
      this.users[0].files.documentsMetaData[0].docCatCode !== ""
    ) {
      for (
        let index = 0;
        index < this.users[0].files.documentsMetaData.length;
        index++
      ) {
        const fileMetadata = this.users[0].files.documentsMetaData;
        let arr = [];
        let indice: number;
        let indexLOD: number;
        this.LOD.filter((ele, i) => {
          if (ele.code === fileMetadata[index].docCatCode) {
            indice = index;
            indexLOD = i;
            ele.selectedDocRefId = fileMetadata[index].docRefId
              ? fileMetadata[index].docRefId
              : "";
            arr.push(ele);
          }
        });
        if (arr.length > 0) {
          let temp = arr[0].documentTypes.filter(
            (ele) => ele.code === fileMetadata[indice].docTypCode
          );
          this.LOD[indexLOD].selectedDocName = temp[0].code;
          this.LOD[indexLOD].selectedDocRefId = arr[0].selectedDocRefId
            ? arr[0].selectedDocRefId
            : "";
        }
      }
    } else return;
  }

  /**
   *@description method to change the current user to be shown as None value in the same as array.
   *@private
   * @memberof FileUploadComponent
   */
  private setNoneApplicant() {
    // const noneApplicant = {
    //   demographicMetadata: {
    //     [""]: [
    //       {
    //         language: this.userPrefLanguage,
    //         value: "None",
    //       },
    //     ],
    //   },
    //   preRegistrationId: "",
    // };
    // let i: number = 0;
    // const temp = JSON.parse(
    //   JSON.stringify(this.allApplicants.push(noneApplicant))
    // );
    // let noneCount: Boolean = this.isNoneAvailable();
    // for (let applicant of this.allApplicants) {
    //   if (this.users) {
    //     if (applicant.preRegistrationId == this.preRegId) {
    //       this.allApplicants.splice(i, 1);
    //       //this.allApplicants.push(noneApplicant);
    //       console.log(JSON.stringify(this.allApplicants));
    //       //this.removeExtraNone();
    //     }
    //     i++;
    //   }
    // }
    let allApplicants = this.allApplicants;
    if (this.users && allApplicants) {
      let filtered = allApplicants.filter(applicant => applicant.preRegistrationId !== this.preRegId);
      this.allApplicants = filtered;
    }  
  }
  /**
   *@description method to initialise the allowedFiles array used to show in the html page
   *
   * @param {string[]} allowedFiles
   * @memberof FileUploadComponent
   */
  getAllowedFileTypes(allowedFiles: string[]) {
    let i = 0;
    for (let file of allowedFiles) {
      if (i == 0) {
        this.allowedFilesHtml =
          this.allowedFilesHtml + file.substring(file.indexOf("/") + 1);
      } else {
        this.allowedFilesHtml =
          this.allowedFilesHtml + "," + file.substring(file.indexOf("/") + 1);
      }
      i++;
    }
  }
  /**
   *@description method to set the value of allowed file size to be displayed in html
   *
   * @memberof FileUploadComponent
   */
  getFileSize() {
    this.allowedFileSize =
      (
        this.config.getConfigByKey(
          appConstants.CONFIG_KEYS.preregistration_document_alllowe_file_size
        ) / 1000000
      ).toString() + "mb";
  }

  /**
   *
   *@description after add applicant the allaplicants array contains an extra none.
   *This method removes this extra none.
   * @memberof FileUploadComponent
   */
  removeExtraNone() {
    let i: number = 0;
    for (let applicant of this.allApplicants) {
      if (applicant.preRegistrationId == "") {
        this.allApplicants.splice(i, 1);
      }
      i++;
    }
  }
  /**
   *@description method to check if none is available or not
   *
   * @returns
   * @memberof FileUploadComponent
   */
  isNoneAvailable() {
    let noneCount: number = 0;
    for (let applicant of this.allApplicants) {
      if (applicant.preRegistrationId == "") {
        noneCount++;
      }
    }
    return true;
  }
  /**
   *@description method to sorf the files in the users array according to the doccument categories in LOD. Will be used in future for sorting files.
   *
   * @memberof FileUploadComponent
   */
  sortUserFiles() {
    for (let document of this.LOD) {
      for (let file of this.users[0].files.documentsMetaData) {
        if (document.code === file.docCatCode) {
          this.sortedUserFiles.push(file);
        }
      }
    }
    for (let i = 0; i <= this.users[0].files[0].documentsMetaData; i++) {
      this.users[0].files[0][i] = this.sortedUserFiles[i];
    }
  }

  /**
   *
   *@description method to get applicants name array to be shown in same as List.
   * @param {*} applicants
   * @returns
   * @memberof FileUploadComponent
   */
  getApplicantsName(applicants) {
    let i = 0;
    let j = 0;
    let allApplicants: any[] = [];

    allApplicants = JSON.parse(JSON.stringify(applicants));
    let name = this.config.getConfigByKey(
      appConstants.CONFIG_KEYS.preregistartion_identity_name
    );
    for (let applicant of allApplicants) {
      for (let name of applicant) {
        if (
          name["demographicMetadata"][name][j].language != this.userPrefLanguage
        ) {
          allApplicants[i].demographicMetadata.firstName.splice(j, 1);
        }
        j++;
      }
      i++;
    }
    //console.log("allApplicants>>>" + JSON.stringify(allApplicants));
    return allApplicants;
  }
  /**
   *
   *@description method to get the applicant type code to fetch the document cagtegories to be uploaded.
   * @memberof FileUploadComponent
   */
  async getApplicantTypeID() {
    //console.log("getApplicantTypeID");
    let requestDTO: DocumentCategoryDTO = {
      attribute: "",
      value: "",
    };

    let DOBDTO: DocumentCategoryDTO = {
      attribute: "",
      value: "",
    };

    let genderDTO: DocumentCategoryDTO = {
      attribute: "",
      value: "",
    };

    let biometricDTO: DocumentCategoryDTO = {
      attribute: "",
      value: "",
    };

    let requestArray = {
      attributes: [],
    };
    let DOCUMENT_CATEGORY_DTO: RequestModel;
    let DOB = this.users[0].request.demographicDetails.identity.dateOfBirth;

    requestDTO.attribute =
      appConstants.APPLICANT_TYPE_ATTRIBUTES.individualTypeCode;
    // for (let language of this.users[0].request.demographicDetails.identity
    //   .residenceStatus) {
    //   if (language.language === this.userPrefLanguage) {
    //     requestDTO.value = language.value;
    //   }
    // }
    requestDTO.value =
      this.users[0].request.demographicDetails.identity.residenceStatus[0].value;
    requestArray.attributes.push(requestDTO);

    DOBDTO.attribute = appConstants.APPLICANT_TYPE_ATTRIBUTES.dateofbirth;
    DOBDTO.value = DOB.replace(/\//g, "-") + "T11:46:12.640Z";

    requestArray.attributes.push(DOBDTO);

    genderDTO.attribute = appConstants.APPLICANT_TYPE_ATTRIBUTES.genderCode;
    genderDTO.value =
      this.users[0].request.demographicDetails.identity.gender[0].value;

    requestArray.attributes.push(genderDTO);

    biometricDTO.attribute =
      appConstants.APPLICANT_TYPE_ATTRIBUTES.biometricAvailable;
    biometricDTO.value = false;

    requestArray.attributes.push(biometricDTO);

    DOCUMENT_CATEGORY_DTO = new RequestModel(
      appConstants.IDS.applicantTypeId,
      requestArray,
      {}
    );
    return new Promise((resolve) => {
      this.subscriptions.push(
        this.dataStorageService
        .getApplicantType(DOCUMENT_CATEGORY_DTO)
        .subscribe(
          async (response) => {
            if (response[appConstants.RESPONSE]) {
              localStorage.setItem(
                "applicantType",
                response["response"].applicantType.applicantTypeCode
              );
              //console.log(`applicantType: ${response["response"].applicantType.applicantTypeCode}`);
              //console.log("getDocumentCategories started");
              await this.getDocumentCategories(
                response["response"].applicantType.applicantTypeCode
              );
              this.setApplicantType(response);
              //console.log("getDocumentCategories done");
              resolve(true);
            } else {
              this.displayMessage(
                this.fileUploadLanguagelabels.uploadDocuments.error,
                this.errorlabels.error
              );
              resolve(true);
            }
          },
          (error) => {
            this.displayMessage("Error", this.errorlabels.error, error);
            resolve(true);
          }
        )
      );
    });    
  }

  /**
   *@description method to set applicant type.
   *
   * @param {*} response
   * @memberof FileUploadComponent
   */
  async setApplicantType(response) {
    this.applicantType = await response["response"].applicationtypecode;
  }
  /**
   *@description method to get document catrgories from master data.
   *
   * @param {*} applicantcode
   * @memberof FileUploadComponent
   */
  async getDocumentCategories(applicantcode) {
    return new Promise((resolve) => {
      this.subscriptions.push(
        this.dataStorageService
        .getDocumentCategories(applicantcode)
        .subscribe(
          (res) => {
            if (res[appConstants.RESPONSE]) {
              let documentCategories = res["response"].documentCategories;
              //console.log("documentCategories received");
              documentCategories.forEach((documentCategory) => {
                this.uiFields.forEach((uiField) => {
                  if (uiField.subType == documentCategory.code) {
                    if (uiField.inputRequired) {
                      documentCategory["required"] = uiField.required;
                      documentCategory["labelName"] =
                        uiField.labelName[this.userPrefLanguage];
                      documentCategory["containerStyle"] = uiField.containerStyle;
                      documentCategory["headerStyle"] = uiField.headerStyle;
                      documentCategory["id"] = uiField.id;
                      this.userForm.addControl(uiField.id, new FormControl(""));
                      if (uiField.required) {
                        this.userForm.controls[uiField.id].setValidators(
                          Validators.required
                        );
                      }
                      this.userForm.controls[uiField.id].setValue("");
                      this.LOD.push(documentCategory);
                    }
                  }
                });
              });
              if (this.userFiles && this.userFiles["documentsMetaData"]) {
                this.userFiles["documentsMetaData"].forEach((userFile) => {
                  this.uiFields.forEach((uiField) => {
                    if (uiField.subType == userFile.docCatCode) {
                      if (this.userForm.controls[uiField.id]) {
                        this.userForm.controls[uiField.id].setValue(
                          userFile.docName
                        );
                      }
                    }
                  });
                });
              }
              //this.LOD = res["response"].documentCategories;
              //console.log(this.LOD);
              this.enableBrowseButtonList = new Array(this.LOD.length).fill(
                false
              );
              this.onModification();
              //console.log(this.LOD);
              resolve(true);
            } else {
              this.displayMessage(
                this.fileUploadLanguagelabels.uploadDocuments.error,
                this.errorlabels.error
              );
              resolve(true);
            }
          },
          (error) => {
            this.displayMessage("Error", this.errorlabels.error, error);
            resolve(true);
          }
        )
      );  
    });  
  }

  /**
   *@description method to get the list of applicants to eb shown in same as options
   *
   * @memberof FileUploadComponent
   */
  async getAllApplicants() {
    return new Promise((resolve) => {
      this.subscriptions.push(
        this.dataStorageService.getUsers(this.loginId).subscribe(
          (response) => {
            if (response[appConstants.RESPONSE]) {
              this.bookingService.addApplicants(
                response["response"]["basicDetails"]
              );
            } else {
              this.displayMessage(
                this.fileUploadLanguagelabels.uploadDocuments.error,
                this.errorlabels.error
              );
            }
          },
          (err) => {
            this.displayMessage(
              this.fileUploadLanguagelabels.uploadDocuments.error,
              this.errorlabels.error,
              err
            );
          },
          () => {
            this.setApplicants();
            resolve(true)
          }
        )
      );
    });    
  }
  
  /**
   *@description method to set the applicants array  used in same as options aray
   *
   * @memberof FileUploadComponent
   */
  setApplicants() {
    this.applicants = JSON.parse(
      JSON.stringify(this.bookingService.getAllApplicants())
    );
    this.removeApplicantsWithoutPOA();
    this.updateApplicants();
    let temp = this.getApplicantsName(this.applicants);
    this.allApplicants = JSON.parse(JSON.stringify(temp));
    console.log("this.allApplicants" + this.allApplicants.length);
    temp = JSON.parse(JSON.stringify(this.allApplicants));
    this.setNoneApplicant();
  }

  removeApplicantsWithoutPOA() {
    let i = 0;
    let tempApplicants = [];
    for (let applicant of this.applicants) {
      if (applicant.demographicMetadata["proofOfAddress"] != null) {
        tempApplicants.push(this.applicants[i]);
      }
      i++;
    }
    this.applicants = JSON.parse(JSON.stringify(tempApplicants));
  }

  updateApplicants() {
    let flag: boolean = false;
    let x: number = 0;
    for (let i of this.activeUsers) {
      for (let j of this.applicants) {
        if (i.preRegId == j.preRegistrationId) {
          flag = true;
          break;
        }
      }
      if (flag) {
        this.activeUsers.splice(x, 1);
      }
      x++;
    }
    let fullName: FullName = {
      language: "",
      value: "",
    };
    let user: Applicants = {
      preRegistrationId: "",
      demographicMetadata: {
        fullName: [fullName],
      },
    };
    let activeUsers: any[] = [];
    for (let i of this.activeUsers) {
      fullName = {
        language: "",
        value: "",
      };
      user = {
        preRegistrationId: "",
        demographicMetadata: {
          fullName: [fullName],
        },
      };
      if (i.files) {
        for (let file of i.files.documentsMetaData) {
          if (file.docCatCode === "POA") {
            user.preRegistrationId = i.preRegId;
            user.demographicMetadata.fullName =
              i.request.demographicDetails.identity.fullName;
            activeUsers.push(JSON.parse(JSON.stringify(user)));
          }
        }
      }
    }

    for (let i of activeUsers) {
      this.applicants.push(i);
    }
  }

  /**
   *@description method to preview the first file.
   *
   * @memberof FileUploadComponent
   */
  viewFirstFile() {
    this.fileIndex = 0;
    this.viewFile(this.users[0].files[0].documentsMetaData[0]);
  }
  /**
   *@description method to preview file by index.
   *
   * @param {number} i
   * @memberof FileUploadComponent
   */
  viewFileByIndex(i: number) {
    this.viewFile(this.users[0].files.documentsMetaData[i]);
  }

  setByteArray(fileByteArray) {
    this.fileByteArray = fileByteArray;
  }

  /**
   *@description method to preview a specific file.
   *
   * @param {FileModel} file
   * @memberof FileUploadComponent
   */
  viewFile(fileMeta: FileModel) {
    this.fileIndex = 0;
    this.disableNavigation = true;
    const subs = this.dataStorageService
      .getFileData(fileMeta.documentId, this.users[0].preRegId)
      .subscribe(
        (res) => {
          if (res[appConstants.RESPONSE]) {
            this.setByteArray(res["response"].document);
          } else {
            this.displayMessage(
              this.fileUploadLanguagelabels.uploadDocuments.error,
              this.errorlabels.error
            );
            this.start = false;
          }
          this.fileName = fileMeta.docName;
          this.fileDocCatCode = fileMeta.docCatCode;
          let i = 0;
          for (let x of this.users[0].files.documentsMetaData) {
            if (
              this.fileName === x.docName &&
              this.fileDocCatCode === x.docCatCode
            ) {
              break;
            }
            i++;
          }
          this.fileIndex = i;
          this.fileExtension = fileMeta.docName.substring(
            fileMeta.docName.indexOf(".") + 1
          );
          this.fileExtension = this.fileExtension.toLowerCase();
          if (this.fileByteArray) {
            switch (this.fileExtension) {
              case "pdf":
                this.flag = false;
                this.fileUrl =
                  "data:application/pdf;base64," + this.fileByteArray;
                break;
              default:
                this.flag = true;
                this.fileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
                  "data:image/jpeg;base64," + this.fileByteArray
                );
                break;
            }
          }
          this.disableNavigation = false;
        },
        (error) => {
          this.displayMessage("Error", this.errorlabels.error, error);
        },
        () => {}
      );
    this.subscriptions.push(subs);
  }

  /**
   *@description method to preview last available file.
   *
   * @memberof FileUploadComponent
   */
  viewLastFile() {
    this.fileIndex = this.users[0].files[0].documentsMetaData.length - 1;
    this.viewFile(this.users[0].files[0].documentsMetaData[this.fileIndex]);
  }

  /**
   * dynamic assigning of idSS
   *
   * @param {*} i
   * @memberof FileUploadComponent
   */
  clickOnButton(i) {
    document.getElementById("file_" + i).click();
  }

  /**
   *@description method gets called when a file has been uploaded from the html.
   *
   * @param {*} event
   * @memberof FileUploadComponent
   */
  handleFileInput(
    event: any,
    docName: string,
    docCode: string,
    docRefId: string
  ) {
    const extensionRegex = new RegExp(
      "(?:" + this.allowedFilesHtml.replace(/,/g, "|") + ")"
    );
    const oldFileExtension = this.fileExtension;
    this.fileExtension = event.target.files[0].name.substring(
      event.target.files[0].name.indexOf(".") + 1
    );
    this.fileExtension = this.fileExtension.toLowerCase();
    let allowedFileUploaded: Boolean = false;
    this.disableNavigation = true;

    // if (event.target.files[0].type === file) {
    if (extensionRegex.test(this.fileExtension)) {
      allowedFileUploaded = true;
      if (
        event.target.files[0].name.length <
        this.config.getConfigByKey(
          appConstants.CONFIG_KEYS
            .preregistration_document_alllowe_file_name_lenght
        )
      ) {
        if (
          event.target.files[0].size <
          this.config.getConfigByKey(
            appConstants.CONFIG_KEYS.preregistration_document_alllowe_file_size
          )
        ) {
          this.getBase64(event.target.files[0]).then((data) => {
            this.fileByteArray = data;
          });
          if (!this.documentType && !this.documentCategory) {
            this.setJsonString(docName, docCode, docRefId);
          }
          this.sendFile(event);
        } else {
          this.displayMessage(
            this.fileUploadLanguagelabels.uploadDocuments.error,
            this.fileUploadLanguagelabels.uploadDocuments.msg1
          );
          this.disableNavigation = false;
        }
      } else {
        this.displayMessage(
          this.fileUploadLanguagelabels.uploadDocuments.error,
          this.fileUploadLanguagelabels.uploadDocuments.msg5
        );
        this.disableNavigation = false;
      }
      this.fileExtension = oldFileExtension;
    }

    if (!allowedFileUploaded) {
      this.fileExtension = oldFileExtension;
      this.displayMessage(
        this.fileUploadLanguagelabels.uploadDocuments.error,
        this.fileUploadLanguagelabels.uploadDocuments.msg3
      );
      this.disableNavigation = false;
    }
  }

  /**
   *@description method gets called when a value in "docRefId" textbox is changed.
   *
   * @param {*} event
   * @memberof FileUploadComponent
   */
  handleDocRefInput(event: any, docCode: string) {
    const docRefId = event.target.value;
    for (let file of this.users[0].files.documentsMetaData) {
      if (file.docCatCode == docCode) {
        let documentId = file.documentId;
        this.disableNavigation = true;
        const subs = this.dataStorageService
          .updateDocRefId(documentId, this.preRegId, docRefId)
          .subscribe(
            (response) => {
              this.disableNavigation = false;
              if (response[appConstants.RESPONSE]) {
                //docRedId saved
              } else {
                this.displayMessage(
                  this.fileUploadLanguagelabels.uploadDocuments.error,
                  this.errorlabels.error
                );
              }
            },
            (error) => {
              this.disableNavigation = false;
              this.displayMessage("Error", this.errorlabels.error, error);
            }
          );
        this.subscriptions.push(subs);
      }
    }
  }

  /**
   *@description method to get base 64 of a file
   *
   * @param {*} file
   * @returns
   * @memberof FileUploadComponent
   */
  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   *@description method called when the docuemnt type option has been changed in a document category
   *
   * @param {*} event
   * @param {number} index
   * @memberof FileUploadComponent
   */
  selectChange(event, index: number) {
    this.enableBrowseButtonList[index] = true;
    this.LOD[index].selectedDocRefId = "";
    let found = false;
    let i = -1;
    this.documentCategory = event.source.placeholder;
    this.documentType = event.source.value;
    this.selectedDocument.docCatCode = JSON.parse(
      JSON.stringify(this.documentCategory)
    );
    this.selectedDocument.docTypeCode = JSON.parse(
      JSON.stringify(this.documentType)
    );
    if (this.selectedDocuments.length > 0) {
      for (let document of this.selectedDocuments) {
        i++;
        if (document.docCatCode == this.documentCategory) {
          found = true;
          this.selectedDocuments[i] = this.selectedDocument;
          break;
        }
      }
    }
    if (!found) {
      this.selectedDocuments.push(this.selectedDocument);
    }

    this.selectedDocument = {
      docCatCode: "",
      docTypeCode: "",
    };

    this.documentIndex = index;
    this.setJsonString(this.documentType, this.documentCategory, "");
  }

  /**
   *@description method called when the docuemnt type option has been opened in a document category
   *
   * @param {*} event
   * @param {number} index
   * @memberof FileUploadComponent
   */
  openedChange(index: number, event) {
    this.documentCategory = this.LOD[index].code;
    this.documentIndex = index;
    if (this.selectedDocuments.length > 0) {
      for (let document of this.selectedDocuments) {
        if (document.docCatCode == this.documentCategory) {
          this.documentType = document.docTypeCode;
        }
      }
    }
  }
  onFilesChange() {}
  /**
   *@description method to remove the preview of a file.
   *
   * @memberof FileUploadComponent
   */
  removeFilePreview() {
    this.fileName = "";
    this.fileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl("");
    this.fileIndex = -1;
  }

  /**
   *@description method to set the Json string required to send the file to server.
   *
   * @param {*} event
   * @memberof FileUploadComponent
   */
  setJsonString(docName: string, docCode: string, docRefId: string) {
    this.documentUploadRequestBody.docCatCode = docCode;
    this.documentUploadRequestBody.langCode = this.userPrefLanguage;
    this.documentUploadRequestBody.docTypCode = docName;
    this.documentUploadRequestBody.docRefId = docRefId;
    this.documentRequest = new RequestModel(
      appConstants.IDS.documentUpload,
      this.documentUploadRequestBody,
      {}
    );
    this.documentCategory = null;
    this.documentType = null;
  }

  /**
   *@description method to send the file to the server.
   *
   * @param {*} event
   * @memberof FileUploadComponent
   */
  sendFile(event) {
    this.formData.append(
      appConstants.DOCUMENT_UPLOAD_REQUEST_DTO_KEY,
      JSON.stringify(this.documentRequest)
    );
    this.formData.append(
      appConstants.DOCUMENT_UPLOAD_REQUEST_DOCUMENT_KEY,
      event.target.files.item(0)
    );

    const subs = this.dataStorageService
      .sendFile(this.formData, this.users[0].preRegId)
      .subscribe(
        (response) => {
          if (response[appConstants.RESPONSE]) {
            this.updateUsers(response);
          } else {
            this.displayMessage(
              this.fileUploadLanguagelabels.uploadDocuments.error,
              this.errorlabels.error
            );
          }
        },
        (error) => {
          this.displayMessage(
            this.fileUploadLanguagelabels.uploadDocuments.error,
            this.fileUploadLanguagelabels.uploadDocuments.msg7,
            error
          );
        },
        () => {
          this.fileInputVariable.nativeElement.value = "";
          this.disableNavigation = false;
        }
      );
    this.formData = new FormData();
    this.subscriptions.push(subs);
  }

  /**
   *@description method to update the users array after a file has been uploaded.
   *
   * @param {*} fileResponse
   * @memberof FileUploadComponent
   */
  updateUsers(fileResponse) {
    //console.log(fileResponse);
    let i = 0;
    let fileObject = new FileModel();
    fileObject.docCatCode = fileResponse.response.docCatCode;
    fileObject.doc_file_format = fileResponse.response.docFileFormat;
    fileObject.documentId = fileResponse.response.docId;
    fileObject.docName = fileResponse.response.docName;
    fileObject.docTypCode = fileResponse.response.docTypCode;
    fileObject.multipartFile = this.fileByteArray;
    fileObject.prereg_id = this.users[0].preRegId;
    fileObject.docRefId = fileResponse.response.docRefId;
    this.uiFields.forEach((uiField) => {
      if (uiField.subType == fileResponse.response.docCatCode) {
        this.userForm.controls[uiField.id].setValue(
          fileResponse.response.docName
        );
      }
    });
    //console.log(`this.fileDocCatCode: ${this.fileDocCatCode}`);
    if (this.fileDocCatCode == fileResponse.response.docCatCode) {
      this.removeFilePreview();
    }
    //console.log("sendFile");
    for (let file of this.users[0].files.documentsMetaData) {
      if (
        file.docCatCode == fileObject.docCatCode ||
        file.docCatCode == null ||
        file.docCatCode == ""
      ) {
        this.users[this.step].files.documentsMetaData[i] = fileObject;
        break;
      }
      i++;
    }
    if (i == this.users[0].files.documentsMetaData.length) {
      this.users[this.step].files.documentsMetaData.push(fileObject);
    }
    //console.log(this.users[0].files.documentsMetaData);
    this.userFile = [];
  }

  openFile() {
    const file = new Blob(this.users[0].files[0][0].multipartFile, {
      type: "application/pdf",
    });
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl);
  }

  /**
   *@description method called when a same as option has been selected.
   *
   * @param {*} event
   * @memberof FileUploadComponent
   */
  sameAsChange(event, fileMetadata) {
    this.disableNavigation = true;
    if (event.value == "") {
      let arr = fileMetadata.filter((ent) => ent.docCatCode === "POA");
      //console.log("removing file " + arr[0].documentId);
      const subs = this.dataStorageService
        .deleteFile(arr[0].documentId, this.preRegId)
        .subscribe(
          (res) => {
            if (res[appConstants.RESPONSE]) {
              this.sameAsselected = false;
              this.registration.setSameAs(event.value);
              this.removePOADocument();
              let index: number;
              this.LOD.filter((ele, i) => {
                if (ele.code === "POA") index = i;
              });
              this.LOD[index].selectedDocName = "";
              this.LOD[index].selectedDocRefId = "";
              this.uiFields.forEach((uiField) => {
                if (uiField.subType == this.LOD[index].code) {
                  this.userForm.controls[this.LOD[index].id].setValue("");
                }
              });
            }
            this.disableNavigation = false;
          },
          (err) => {
            this.disableNavigation = false;
            this.displayMessage(
              this.fileUploadLanguagelabels.uploadDocuments.error,
              this.fileUploadLanguagelabels.uploadDocuments.msg9,
              err
            );
          }
        );
      this.subscriptions.push(subs);
    } else {
      //console.log("copying file " + event.value);
      const subs = this.dataStorageService
        .copyDocument(event.value, this.users[0].preRegId)
        .subscribe(
          (response) => {
            if (response[appConstants.RESPONSE]) {
              this.registration.setSameAs(event.value);
              this.removePOADocument();
              this.updateUsers(response);
              let index: number;
              let poaTypes = [];
              this.LOD.filter((ele, i) => {
                if (ele.code === "POA") {
                  index = i;
                  poaTypes.push(ele);
                }
              });
              let docList = poaTypes[0].documentTypes.filter(
                (element) => element.code === response["response"]["docTypCode"]
              );
              this.documentName = docList[0].code;
              this.LOD[index].selectedDocName = this.documentName;
              this.LOD[index].selectedDocRefId =
                response["response"]["docRefId"];
              this.sameAsselected = true;  
            } else {
              this.sameAs = this.registration.getSameAs();
              this.sameAsselected = false;
              this.displayMessage(
                this.fileUploadLanguagelabels.uploadDocuments.error,
                this.fileUploadLanguagelabels.uploadDocuments.msg9
              );
            }
            this.disableNavigation = false;
          },
          (err) => {
            this.displayMessage(
              this.fileUploadLanguagelabels.uploadDocuments.error,
              this.fileUploadLanguagelabels.uploadDocuments.msg8,
              err
            );
            this.sameAs = this.registration.getSameAs();
            this.sameAsselected = false;
            this.disableNavigation = false;
          }
        );
        this.subscriptions.push(subs);
      // this.subscriptions.push(subs);
      // this.sameAsselected = true;
      // this.disableNavigation = false;
    }
  }

  /**
   *@description method to remove the POA document from users array when same as option has been selected.
   *
   * @memberof FileUploadComponent
   */
  removePOADocument() {
    //console.log("removePOADocument");
    this.userFiles = new FilesModel();
    //let i = 0;
    // if (this.users[0].files.documentsMetaData) {
    //   for (let file of this.users[0].files.documentsMetaData) {
    //     console.log(file);
    //     if (file.docCatCode == "POA") {
    //       this.users[0].files.documentsMetaData.splice(i, 1);
    //     }
    //     i++;
    //   }
    // }
    let allFiles = this.users[0].files.documentsMetaData;
    if (allFiles) {
      let updatedFiles = allFiles.filter(file => file.docCatCode !== "POA");
      //console.log(updatedFiles);
      this.users[0].files.documentsMetaData = updatedFiles;
    }
  }

  ifDisabled(category) {
    this.users[0].files[0].documentsMetaData.forEach((element) => {
      if ((element.docCatCode = category)) {
        return true;
      }
    });
    return false;
  }

  /**
   *@description method called when back button has been clicked.
   *
   * @memberof FileUploadComponent
   */
  onBack() {
    localStorage.setItem("modifyUser", "true");
    let url = Utils.getURL(this.router.url, "demographic");
    this.router.navigateByUrl(url + `/${this.preRegId}`);
  }

  /**
   *@description method called when next button has been clicked.
   *
   * @memberof FileUploadComponent
   */
  async onNext() {
    if (this.readOnlyMode) {
      localStorage.setItem("modifyDocument", "false");
      let url = Utils.getURL(this.router.url, "summary");
      this.router.navigateByUrl(url + `/${this.preRegId}/preview`);
    } else {
      //first update the application status from "Application_Incomplete" to "Pending_Appointment"
      this.uiFields.forEach((control) => {
        const controlId = control.id;
        if (this.userForm.controls[`${controlId}`]) {
          this.userForm.controls[`${controlId}`].markAsTouched();
        }
      });
      if (this.userForm.valid) {
        await this.updateApplicationStatus();
        localStorage.setItem("modifyDocument", "false");
        let url = Utils.getURL(this.router.url, "summary");
        this.router.navigateByUrl(url + `/${this.preRegId}/preview`);
      }
    }
  }

  updateApplicationStatus = async () => {
    return new Promise((resolve) => {
      //update the application status from "Application_Incomplete" to "Pending_Appointment"
      this.dataStorageService.getApplicationStatus(this.users[0].preRegId).subscribe(
        (response) => {
          const applicationStatus = response["response"]["statusCode"];
          if (applicationStatus === appConstants.APPLICATION_STATUS_CODES.incomplete) {
            console.log("updating application status from incomplete to pending");
            this.dataStorageService.updateApplicationStatus(
            this.users[0].preRegId, appConstants.APPLICATION_STATUS_CODES.pending)
            .subscribe(
              (response) => {
                resolve(true);
              },
              (error) => {
                resolve(true);      
              }
            );
          }
          resolve(true);
        },
        (error) => {
          resolve(true);      
        }
      );
    });  
  }

  /**
   *@description method to preview the next file in the html page
   *
   * @param {number} fileIndex
   * @memberof FileUploadComponent
   */
  nextFile(fileIndex: number) {
    this.fileIndex = fileIndex + 1;
    this.viewFileByIndex(this.fileIndex);
  }

  /**
   *@description method to preview the previous file in the html page
   *
   * @param {number} fileIndex
   * @memberof FileUploadComponent
   */
  previousFile(fileIndex: number) {
    this.fileIndex = fileIndex - 1;
    this.viewFileByIndex(this.fileIndex);
  }

  /**
   *@description method to set and display error message.
   *
   * @param {string} title
   * @param {string} message
   * @memberof FileUploadComponent
   */
  displayMessage(title: string, message: string, error?: any) {
    if (
      error &&
      error[appConstants.ERROR] &&
      error[appConstants.ERROR][appConstants.NESTED_ERROR][0].errorCode ===
        appConstants.ERROR_CODES.tokenExpired
    ) {
      message = this.errorlabels.tokenExpiredLogout;
      title = "";
    }
    const messageObj = {
      case: "MESSAGE",
      title: title,
      message: message,
    };
    this.openDialog(messageObj, "250px");
  }

  /**
   *@description method to open dialog box to show the error message
   *
   * @param {*} data
   * @param {*} width
   * @returns
   * @memberof FileUploadComponent
   */
  openDialog(data, width) {
    const dialogRef = this.dialog.open(DialougComponent, {
      width: width,
      data: data,
    });
    return dialogRef;
  }

  changeStatus(event, index: number) {
    this.LOD[index].selectedDocName = event.value;
  }

  changeDocRefId(event, index: number) {
    this.LOD[index].selectedDocRefId = event.target.value;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}

export interface DocumentUploadRequestDTO {
  docCatCode: string;
  docTypCode: string;
  langCode: string;
  docRefId: string;
}

export interface DocumentCategoryDTO {
  attribute: string;
  value: any;
}

export interface DocumentCategory {
  code: string;
  description: string;
  isActive: string;
  langCode: string;
  name: string;
  documentTypes?: DocumentCategory[];
  selectedDocName?: string;
  selectedDocRefId: string;
  labelName: string;
  required: boolean;
  containerStyle: {};
  headerStyle: {};
  id: string;
}

export interface Applicants {
  bookingMetadata?: string;
  preRegistrationId: string;
  demographicMetadata: DemographicMetaData;
  statusCode?: string;
}
export interface FullName {
  language: string;
  value: string;
}
export interface ProofOfAddress {
  docId: string;
  docName: string;
  docCatCode: string;
  docTypCode: string;
  docFileFormat?: string;
  docRefId: string;
}

export interface DemographicMetaData {
  fullName?: FullName[];
  postalCode?: string;
  proofOfAddress?: ProofOfAddress;
}

export interface SelectedDocuments {
  docCatCode: string;
  docTypeCode: string;
}
