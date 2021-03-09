import { Component, OnInit, OnDestroy } from "@angular/core";
import * as html2pdf from "html2pdf.js";
import { MatDialog } from "@angular/material";
import { BookingService } from "../../booking/booking.service";
import { DialougComponent } from "src/app/shared/dialoug/dialoug.component";
import { TranslateService } from "@ngx-translate/core";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { NotificationDtoModel } from "src/app/shared/models/notification-model/notification-dto.model";
import Utils from "src/app/app.util";
import * as appConstants from "../../../app.constants";
import { RequestModel } from "src/app/shared/models/request-model/RequestModel";
import LanguageFactory from "src/assets/i18n";
import { Subscription } from "rxjs";
import { ConfigService } from "src/app/core/services/config.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NameList } from "src/app/shared/models/demographic-model/name-list.modal";
import { UserModel } from "src/app/shared/models/demographic-model/user.modal";

@Component({
  selector: "app-acknowledgement",
  templateUrl: "./acknowledgement.component.html",
  styleUrls: ["./acknowledgement.component.css"],
})
export class AcknowledgementComponent implements OnInit, OnDestroy {
  secondaryLanguagelabels: any;
  secondaryLang = localStorage.getItem("secondaryLangCode");
  usersInfo = [];
  finalUsersInfoDetails = {};
  secondaryLanguageRegistrationCenter: any;
  guidelines = [];
  guidelinesDetails = [];
  opt = {};
  fileBlob: Blob;
  showSpinner: boolean = true;
  notificationRequest = new FormData();
  bookingDataPrimary = "";
  bookingDataSecondary = "";
  subscriptions: Subscription[] = [];
  notificationTypes: string[];
  preRegId: any;
  nameList: NameList = {
    preRegId: "",
    fullName: "",
    fullNameSecondaryLang: "",
    regDto: "",
    status: "",
    registrationCenter: "",
    bookingData: "",
    postalCode: "",
    langCode: "",
  };
  regCenterId;
  primaryLangCode;
  name = "";
  applicantContactDetails = [];
  constructor(
    private bookingService: BookingService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private dataStorageService: DataStorageService,
    private configService: ConfigService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.translate.use(localStorage.getItem("langCode"));
    this.primaryLangCode = localStorage.getItem("langCode");
  }

  async ngOnInit() {
    if (this.router.url.includes("multiappointment")) {
      this.preRegId = [
        ...JSON.parse(localStorage.getItem("multiappointment")),
      ];
    } else {
      this.activatedRoute.params.subscribe((param) => {
        this.preRegId = [param["appId"]];
      });
    }
    this.name = this.configService.getConfigByKey(
      appConstants.CONFIG_KEYS.preregistartion_identity_name
    );
    await this.getUserInfo(this.preRegId);
    let i, self = this;
    for (i = 0; i < self.usersInfo.length; i++) {
      await this.getRegCenterDetails(self.usersInfo[i].langCode, i);
      await this.getLabelDetails(self.usersInfo[i].langCode, i);
    }

    let notificationTypes = this.configService
      .getConfigByKey(appConstants.CONFIG_KEYS.mosip_notification_type)
      .split("|");
    this.notificationTypes = notificationTypes.map((item) =>
      item.toUpperCase()
    );
    this.opt = {
      margin: [0, 0.5, 0.5, 0],
      filename: this.usersInfo[0].preRegId + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 1 },
      jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
    };

    await this.apiCalls();

    if (this.bookingService.getSendNotification()) {
      this.bookingService.resetSendNotification();
      this.automaticNotification();
    }
    await this.manipulateUserInfo();
  }

  getUserInfo(preRegId) {
    let self = this;
    return new Promise((resolve) => {
      preRegId.forEach(async (prid: any, index) => {

        await this.getUserDetails(prid).then(async (user) => {
          let regDto;

          await this.getAppointmentDetails(prid).then(
            (appointmentDetails) => {
              regDto = appointmentDetails;
            }
          );

          let i, self = this;
          for (i = 0; i < user["request"].demographicDetails.identity.gender.length; i++) {
            const nameList: NameList = {
              preRegId: "",
              fullName: "",
              fullNameSecondaryLang: "",
              regDto: "",
              status: "",
              registrationCenter: "",
              bookingData: "",
              postalCode: "",
              langCode : "",
              labelDetails : [],
            };
            nameList.preRegId = user["request"].preRegistrationId;
            nameList.status = user["request"].statusCode;
            nameList.fullName = user["request"].demographicDetails.identity[self.name][i].value;
            nameList.postalCode = user["request"].demographicDetails.identity.postalCode;
            nameList.registrationCenter = "";
            nameList.langCode = user["request"].demographicDetails.identity.gender[i].language;
            nameList.regDto = regDto;
            self.usersInfo.push(nameList);
          }

          this.applicantContactDetails[1] =  user["request"].demographicDetails.identity.phone;
          this.applicantContactDetails[0] =  user["request"].demographicDetails.identity.email;
        });

        if (index === preRegId.length - 1) {
          resolve(true);
        }

      });
    });
  }

  getUserDetails(prid) {
    return new Promise((resolve) => {
      this.dataStorageService.getUser(prid.toString()).subscribe((response) => {
        if (response[appConstants.RESPONSE] !== null) {
          resolve(
            new UserModel(
              prid.toString(),
              response[appConstants.RESPONSE],
              undefined,
              []
            )
          );
        }
      });
    });
  }

  getAppointmentDetails(preRegId) {
    return new Promise((resolve) => {
      this.dataStorageService
        .getAppointmentDetails(preRegId)
        .subscribe((response) => {
          console.log(response);
          this.regCenterId =
            response[appConstants.RESPONSE].registration_center_id;
          resolve(response[appConstants.RESPONSE]);
        });
    });
  }

  getRegCenterDetails(langCode, index) {
    return new Promise((resolve) => {
      this.dataStorageService
        .getRegistrationCentersById(this.regCenterId, langCode)
        .subscribe((response) => {
          if (response[appConstants.RESPONSE]) {
            this.usersInfo[index].registrationCenter = response[appConstants.RESPONSE].registrationCenters[0];
            resolve(true);
          }
        });
    });
  }

  getLabelDetails(langCode, index) {
    let factory = new LanguageFactory(langCode);
    let response = factory.getCurrentlanguage();
    this.usersInfo[index].labelDetails.push(response["acknowledgement"]);
  }

  manipulateUserInfo(){
    let i, j, self = this, preRegIdLabels = [], appDateLabels = [], contactPhoneLabels = [], messages = [], labelNames = [], nameValues = [], labelRegCntrs = [], regCntrNames = [], appLangCode = [], labelRegCntrDtl = [], RegCntrDtl = [];   
    self.finalUsersInfoDetails["qrCodeBlob"] = self.usersInfo[0].qrCodeBlob;
    self.finalUsersInfoDetails["preRegId"] = self.usersInfo[0].preRegId;
    self.finalUsersInfoDetails["bookingTimePrimary"] = self.usersInfo[0].bookingTimePrimary; 
    self.finalUsersInfoDetails["bookingDataPrimary"] = self.usersInfo[0].bookingDataPrimary;
    self.finalUsersInfoDetails["contactPhone"] = self.usersInfo[0].registrationCenter.contactPhone;
    for (i = 0; i < self.usersInfo.length; i++) {
      preRegIdLabels.push(self.usersInfo[i].labelDetails[0].label_pre_id);
      appDateLabels.push(self.usersInfo[i].labelDetails[0].label_appointment_date_time);
      contactPhoneLabels.push(self.usersInfo[i].labelDetails[0].label_cntr_contact_number);
      messages.push(self.usersInfo[i].labelDetails[0].message);
      labelNames.push(self.usersInfo[i].labelDetails[0].label_name);     
      nameValues.push(self.usersInfo[i].fullName); 
      labelRegCntrs.push(self.usersInfo[i].labelDetails[0].label_reg_cntr);
      regCntrNames.push(self.usersInfo[i].registrationCenter.name);
      appLangCode.push(self.usersInfo[i].langCode);
      /*labelRegCntrDtl.push(self.usersInfo[i].labelDetails[0].label_reg_cntr_dtl);
      RegCntrDtl.push(self.usersInfo[i].registrationCenter.name);*/
    }
    self.finalUsersInfoDetails["appLangCode"] = appLangCode;
    self.finalUsersInfoDetails["preRegIdLabels"] = JSON.stringify(preRegIdLabels).replace(/\[/g, '').replace(/,/g, ' / ').replace(/"/g, ' ').replace(/]/g, '');
    self.finalUsersInfoDetails["appDateLabels"] = JSON.stringify(appDateLabels).replace(/\[/g, '').replace(/,/g, ' / ').replace(/"/g, ' ').replace(/]/g, '');
    self.finalUsersInfoDetails["contactPhoneLabels"] = JSON.stringify(contactPhoneLabels).replace(/\[/g, '').replace(/,/g, ' / ').replace(/"/g, ' ').replace(/]/g, '');
    self.finalUsersInfoDetails["messages"] = JSON.stringify(messages).replace(/\[/g, '').replace(/,/g, ' / ').replace(/"/g, ' ').replace(/]/g, '');
    self.finalUsersInfoDetails["labelNames"] = JSON.stringify(labelNames).replace(/\[/g, '').replace(/,/g, ' / ').replace(/"/g, ' ').replace(/]/g, '');
    self.finalUsersInfoDetails["nameValues"] = JSON.stringify(nameValues).replace(/\[/g, '').replace(/,/g, ' / ').replace(/"/g, ' ').replace(/]/g, '');
    self.finalUsersInfoDetails["labelRegCntrs"] = JSON.stringify(labelRegCntrs).replace(/\[/g, '').replace(/,/g, ' / ').replace(/"/g, ' ').replace(/]/g, '');
    self.finalUsersInfoDetails["regCntrNames"] = JSON.stringify(regCntrNames).replace(/\[/g, '').replace(/,/g, ' / ').replace(/"/g, ' ').replace(/]/g, '');
    for (j = 0; j < self.guidelines.length; j++) {
      if(appLangCode.includes(self.guidelines[j].langCode)){
        self.finalUsersInfoDetails[self.guidelines[j].langCode] = self.guidelines[j].fileText.split("\n");
      }
    }
  }

  async apiCalls() {
    return new Promise(async (resolve, reject) => {
      /*if (!this.usersInfo[0].registrationCenter) {
        await this.getRegistrationCenterInPrimaryLanguage(
          this.usersInfo[0].regDto.registration_center_id,
          localStorage.getItem("langCode")
        );
        await this.getRegistrationCenterInSecondaryLanguage(
          this.usersInfo[0].regDto.registration_center_id,
          this.secondaryLang
        );
      } else {
        await this.getRegistrationCenterInSecondaryLanguage(
          this.usersInfo[0].registrationCenter.id,
          this.secondaryLang
        );
      }*/
      this.formatDateTime();
      await this.qrCodeForUser();
     /* let factory = new LanguageFactory(this.secondaryLang);
      let response = factory.getCurrentlanguage();
      this.secondaryLanguagelabels = response["acknowledgement"];*/

      await this.getTemplate();
      this.showSpinner = false;
      resolve(true);
    });
  }

  async qrCodeForUser() {
    return new Promise((resolve, reject) => {
      this.usersInfo.forEach(async (user) => {
        await this.generateQRCode(user);
        if (this.usersInfo.indexOf(user) === this.usersInfo.length - 1) {
          resolve(true);
        }
      });
    });
  }

  formatDateTime() {
    for (let i = 0; i < this.usersInfo.length; i++) {
      if (!this.usersInfo[i].bookingData) {
        this.usersInfo[i].bookingDataPrimary = Utils.getBookingDateTime(
          this.usersInfo[i].regDto.appointment_date,
          this.usersInfo[i].regDto.time_slot_from,
          localStorage.getItem("langCode")
        );
        this.usersInfo[i].bookingTimePrimary = Utils.formatTime(
          this.usersInfo[i].regDto.time_slot_from
        );
        this.usersInfo[i].bookingDataSecondary = Utils.getBookingDateTime(
          this.usersInfo[i].regDto.appointment_date,
          this.usersInfo[i].regDto.time_slot_from,
          localStorage.getItem("secondaryLangCode")
        );
        this.usersInfo[i].bookingTimeSecondary = Utils.formatTime(
          this.usersInfo[i].regDto.time_slot_from
        );
      } else {
        const date = this.usersInfo[i].bookingData.split(",");
        this.usersInfo[i].bookingDataPrimary = Utils.getBookingDateTime(
          date[0],
          date[1],
          localStorage.getItem("langCode")
        );
        this.usersInfo[i].bookingTimePrimary = Utils.formatTime(date[1]);
        this.usersInfo[i].bookingDataSecondary = Utils.getBookingDateTime(
          date[0],
          date[1],
          localStorage.getItem("secondaryLangCode")
        );
        this.usersInfo[i].bookingTimeSecondary = Utils.formatTime(date[1]);
      }
    }
  }

  automaticNotification() {
    setTimeout(() => {
      this.sendNotification(this.applicantContactDetails, false);
    }, 500);
  }

  async getRegistrationCenterInSecondaryLanguage(
    centerId: string,
    langCode: string
  ) {
    return new Promise((resolve, reject) => {
      const subs = this.dataStorageService
        .getRegistrationCenterByIdAndLangCode(centerId, langCode)
        .subscribe((response) => {
          this.secondaryLanguageRegistrationCenter =
            response["response"]["registrationCenters"][0];
          resolve(true);
        });
      this.subscriptions.push(subs);
    });
  }

  async getRegistrationCenterInPrimaryLanguage(
    centerId: string,
    langCode: string
  ) {
    return new Promise((resolve, reject) => {
      const subs = this.dataStorageService
        .getRegistrationCenterByIdAndLangCode(centerId, langCode)
        .subscribe((response) => {
          this.usersInfo[0].registrationCenter =
            response["response"]["registrationCenters"][0];
          resolve(true);
        });
      this.subscriptions.push(subs);
    });
  }

  getTemplate() {
    return new Promise((resolve, reject) => {
      const subs = this.dataStorageService
        .getGuidelineTemplate("Onscreen-Acknowledgement")
        .subscribe((response) => {
          this.guidelines = response["response"]["templates"];
          resolve(true);
        });
      this.subscriptions.push(subs);
    });
  }

  download() {
    window.scroll(0, 0);
    const element = document.getElementById("print-section");
    html2pdf(element, this.opt);
  }

  async generateBlob() {
    const element = document.getElementById("print-section");
    return await html2pdf()
      .set(this.opt)
      .from(element)
      .outputPdf("dataurlstring");
  }

  async createBlob() {
    const dataUrl = await this.generateBlob();
    // convert base64 to raw binary data held in a string
    const byteString = atob(dataUrl.split(",")[1]);

    // separate out the mime component
    const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    const arrayBuffer = new ArrayBuffer(byteString.length);

    var _ia = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      _ia[i] = byteString.charCodeAt(i);
    }

    const dataView = new DataView(arrayBuffer);
    return await new Blob([dataView], { type: mimeString });
  }

  sendAcknowledgement() {
    const data = {
      case: "APPLICANTS",
      notificationTypes: this.notificationTypes,
    };
    const subs = this.dialog
      .open(DialougComponent, {
        width: "350px",
        data: data,
      })
      .afterClosed()
      .subscribe((applicantNumber) => {
        if (applicantNumber !== undefined) {
          this.sendNotification(applicantNumber, true);
        }
      });
    this.subscriptions.push(subs);
  }

  async generateQRCode(name) {
    const index = this.usersInfo.indexOf(name);
    if (!this.usersInfo[index].qrCodeBlob) {
      return new Promise((resolve, reject) => {
        const subs = this.dataStorageService
          .generateQRCode(name.preRegId)
          .subscribe((response) => {
            this.usersInfo[index].qrCodeBlob = response["response"].qrcode;
            resolve(true);
          });
      });
    }
  }

  async sendNotification(applicantNumber, additionalRecipient: boolean) {
    this.fileBlob = await this.createBlob();
    this.usersInfo.forEach((user) => {
      const notificationDto = new NotificationDtoModel(
        user.fullName,
        user.preRegId,
        user.bookingData
          ? user.bookingData.split(",")[0]
          : user.regDto.appointment_date,
        Number(user.bookingTimePrimary.split(":")[0]) < 10
          ? "0" + user.bookingTimePrimary
          : user.bookingTimePrimary,
        applicantNumber[1] === undefined ? null : applicantNumber[1],
        applicantNumber[0] === undefined ? null : applicantNumber[0],
        additionalRecipient,
        false
      );
      console.log(notificationDto);
      const model = new RequestModel(
        appConstants.IDS.notification,
        notificationDto
      );
      this.notificationRequest.append(
        appConstants.notificationDtoKeys.notificationDto,
        JSON.stringify(model).trim()
      );
      this.notificationRequest.append(
        appConstants.notificationDtoKeys.langCode,
        localStorage.getItem("langCode")
      );
      this.notificationRequest.append(
        appConstants.notificationDtoKeys.file,
        this.fileBlob,
        `${user.preRegId}.pdf`
      );
      const subs = this.dataStorageService
        .sendNotification(this.notificationRequest)
        .subscribe((response) => {});
      this.subscriptions.push(subs);
      this.notificationRequest = new FormData();
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
