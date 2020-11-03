import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from "@angular/core";
import { Subscription } from "rxjs";
import { MatDialog } from "@angular/material";
import { DialougComponent } from "../../../shared/dialoug/dialoug.component";
import { Router, ActivatedRoute } from "@angular/router";
import smoothscroll from "smoothscroll-polyfill";

import { BookingModel } from "../center-selection/booking.model";
import { NameList } from "src/app/shared/models/demographic-model/name-list.modal";
import { RequestModel } from "src/app/shared/models/request-model/RequestModel";
import { BookingService } from "../booking.service";
import { TranslateService } from "@ngx-translate/core";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { ConfigService } from "src/app/core/services/config.service";
import { BookingDeactivateGuardService } from "src/app/shared/can-deactivate-guard/booking-guard/booking-deactivate-guard.service";

import LanguageFactory from "src/assets/i18n";
import Utils from "src/app/app.util";
import * as appConstants from "../../../app.constants";
import { UserModel } from "src/app/shared/models/demographic-model/user.modal";

@Component({
  selector: "app-time-selection",
  templateUrl: "./time-selection.component.html",
  styleUrls: ["./time-selection.component.css"],
})
export class TimeSelectionComponent
  extends BookingDeactivateGuardService
  implements OnInit, OnDestroy {
  @ViewChild("widgetsContent", { read: ElementRef }) public widgetsContent;
  @ViewChild("cardsContent", { read: ElementRef }) public cardsContent;
  registrationCenter: String;
  selectedCard: number;
  selectedTile = 0;
  limit = [];
  showAddButton = false;
  names: NameList[] = [];
  deletedNames = [];
  availabilityData = [];
  days: number;
  disableAddButton = false;
  activeTab = "morning";
  bookingDataList = [];
  temp: NameList[] = [];
  registrationCenterLunchTime = [];
  secondaryLang = localStorage.getItem("secondaryLangCode");
  secondaryLanguagelabels: any;
  errorlabels: any;
  showMorning: boolean;
  showAfternoon: boolean;
  disableContinueButton = false;
  spinner = true;
  canDeactivateFlag = true;
  DAYS: any;
  primaryLangCode = localStorage.getItem("langCode");
  subscriptions: Subscription[] = [];
  preRegId: any = [];
  userInfo: any = [];
  regCenterInfo: any;
  showsNamesContainer: boolean;
  afternoonSlotAvailable: boolean = false;
  morningSlotAvailable: boolean = false;
  name = "";
  constructor(
    private bookingService: BookingService,
    public dialog: MatDialog,
    private dataService: DataStorageService,
    private router: Router,
    private translate: TranslateService,
    private configService: ConfigService,
    private activatedRoute: ActivatedRoute
  ) {
    super(dialog);
    smoothscroll.polyfill();
    this.translate.use(this.primaryLangCode);
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
    this.activatedRoute.queryParams.subscribe((param) => {
      this.registrationCenter = param["regCenter"];
    });
    this.name = this.configService.getConfigByKey(
      appConstants.CONFIG_KEYS.preregistartion_identity_name
    );
    await this.getUserInfo(this.preRegId);
    await this.getRegCenterDetails();
    this.prepareNameList(this.userInfo, this.regCenterInfo);
    this.days = this.configService.getConfigByKey(
      appConstants.CONFIG_KEYS.preregistration_availability_noOfDays
    );
    if (this.temp[0]) {
      this.registrationCenterLunchTime = this.temp[0].registrationCenter.lunchEndTime.split(
        ":"
      );
    }
    this.getSlotsforCenter(this.registrationCenter);
    let factory = new LanguageFactory(this.primaryLangCode);
    let response = factory.getCurrentlanguage();
    this.secondaryLanguagelabels = response["timeSelection"].booking;
    this.errorlabels = response["error"];
    this.DAYS = response["DAYS"];
  }

  getUserInfo(preRegId) {
    return new Promise(async (resolve) => {
      for (let i = 0; i < preRegId.length; i++) {
        await this.getUserDetails(preRegId[i]).then((user) =>
          this.userInfo.push(user)
        );
      }
      resolve();
    });
  }

  getUserDetails(prid) {
    return new Promise((resolve) => {
      this.dataService.getUser(prid.toString()).subscribe((response) => {
        resolve(
          new UserModel(
            prid.toString(),
            response[appConstants.RESPONSE],
            undefined,
            []
          )
        );
      });
    });
  }

  getRegCenterDetails() {
    return new Promise((resolve) => {
      this.dataService
        .getRegistrationCentersById(
          this.registrationCenter,
          this.primaryLangCode
        )
        .subscribe((response) => {
          if (response[appConstants.RESPONSE]) {
            console.log(response[appConstants.RESPONSE]);
            this.regCenterInfo =
              response[appConstants.RESPONSE].registrationCenters[0];
            resolve(true);
          }
        });
    });
  }

  private prepareNameList(userInfo, regCenterInfo) {
    console.log(this.userInfo.length);
    userInfo.forEach((user) => {
      console.log(user);
      const nameList: NameList = {
        preRegId: "",
        fullName: "",
        fullNameSecondaryLang: "",
        regDto: "",
        status: "",
        registrationCenter: "",
        bookingData: "",
        postalCode: "",
      };

      nameList.preRegId = user.request.preRegistrationId;
      nameList.status = user.request.statusCode;
      nameList.fullName =
        user["request"].demographicDetails.identity[this.name][0].value;
      if(user["request"].demographicDetails.identity[this.name][1])
        nameList.fullNameSecondaryLang =
          user["request"].demographicDetails.identity[this.name][1].value;
      nameList.postalCode = user.request.demographicDetails.identity.postalCode;
      nameList.registrationCenter = regCenterInfo;
      this.names.push(nameList);
      this.temp.push(nameList);
    });
  }

  public scrollRight(): void {
    // for edge browser
    this.widgetsContent.nativeElement.scrollBy({
      left: this.widgetsContent.nativeElement.scrollLeft + 100,
      behavior: "smooth",
    });
    // for chrome browser
    this.widgetsContent.nativeElement.scrollTo({
      left: this.widgetsContent.nativeElement.scrollLeft + 100,
      behavior: "smooth",
    });
  }

  public scrollLeft(): void {
    // for edge browser
    this.widgetsContent.nativeElement.scrollBy({
      left: this.widgetsContent.nativeElement.scrollLeft - 100,
      behavior: "smooth",
    });
    //for chrome browser
    this.widgetsContent.nativeElement.scrollTo({
      left: this.widgetsContent.nativeElement.scrollLeft - 100,
      behavior: "smooth",
    });
  }

  dateSelected(index: number) {
    this.selectedTile = index;
    // this.placeNamesInSlots();
    // this.cardSelected(0);
  }

  cardSelected(index: number): void {
    this.selectedCard = index;
    this.canAddApplicant(
      this.availabilityData[this.selectedTile].timeSlots[this.selectedCard]
    );
  }

  itemDelete(index: number): void {
    this.deletedNames.push(
      this.availabilityData[this.selectedTile].timeSlots[this.selectedCard]
        .names[index]
    );
    this.availabilityData[this.selectedTile].timeSlots[
      this.selectedCard
    ].names.splice(index, 1);
    this.canAddApplicant(
      this.availabilityData[this.selectedTile].timeSlots[this.selectedCard]
    );
  }

  addItem(index: number): void {
    if (
      this.canAddApplicant(
        this.availabilityData[this.selectedTile].timeSlots[this.selectedCard]
      )
    ) {
      this.availabilityData[this.selectedTile].timeSlots[
        this.selectedCard
      ].names.push(this.deletedNames[index]);
      this.deletedNames.splice(index, 1);
    }
  }

  canAddApplicant(slot: any): boolean {
    if (slot.availability > slot.names.length) {
      this.disableAddButton = false;
      return true;
    } else {
      this.disableAddButton = true;
      return false;
    }
  }

  formatJson(centerDetails: any) {
    centerDetails.forEach((element) => {
      let sumAvailability = 0;
      element.timeSlots.forEach((slot) => {
        sumAvailability += slot.availability;
        slot.names = [];
        let fromTime = slot.fromTime.split(":");
        let toTime = slot.toTime.split(":");
        if (this.registrationCenterLunchTime[0] === null) {
          slot.tag = "morning";
          element.showMorning = true;
          this.morningSlotAvailable = true;
          this.afternoonSlotAvailable = false;
        } else if (
          this.registrationCenterLunchTime[0] !== null &&
          this.registrationCenterLunchTime[0].split(":")[0] === "00"
        ) {
          slot.tag = "morning";
          element.showMorning = true;
          this.morningSlotAvailable = true;
          this.afternoonSlotAvailable = false;
        } else if (fromTime[0] < this.registrationCenterLunchTime[0]) {
          slot.tag = "morning";
          element.showMorning = true;
          this.morningSlotAvailable = true;
        } else {
          slot.tag = "afternoon";
          element.showAfternoon = true;
          this.afternoonSlotAvailable = true;
        }
        slot.displayTime =
          Number(fromTime[0]) > 12 ? Number(fromTime[0]) - 12 : fromTime[0];
        slot.displayTime += ":" + fromTime[1] + " - ";
        slot.displayTime +=
          Number(toTime[0]) > 12 ? Number(toTime[0]) - 12 : toTime[0];
        slot.displayTime += ":" + toTime[1];
      });
      element.TotalAvailable = sumAvailability;
      element.inActive = false;
      element.displayDate = Utils.getBookingDateTime(
        element.date,
        "",
        this.primaryLangCode
      );
      let index = new Date(Date.parse(element.date)).getDay();
      element.displayDay = this.DAYS[index];
      if (!element.inActive) {
        this.availabilityData.push(element);
      }
    });
    this.enableBucketTabs();
    this.deletedNames = [...this.names];
    // this.placeNamesInSlots();
  }

  placeNamesInSlots() {
    this.availabilityData[this.selectedTile].timeSlots.forEach((slot) => {
      if (this.names.length !== 0) {
        while (
          slot.names.length < slot.availability &&
          this.names.length !== 0
        ) {
          slot.names.push(this.names[0]);
          this.names.splice(0, 1);
        }
      }
    });
    this.enableBucketTabs();
  }

  enableBucketTabs() {
    const element = this.availabilityData[this.selectedTile];
    if (element.showMorning && element.showAfternoon) {
      this.tabSelected("morning");
    } else if (element.showMorning) {
      this.tabSelected("morning");
    } else {
      this.tabSelected("afternoon");
    }
  }

  getSlotsforCenter(id) {
    const subs = this.dataService.getAvailabilityData(id).subscribe(
      (response) => {
        this.spinner = false;
        if (response[appConstants.RESPONSE]) {
          if (response[appConstants.RESPONSE].centerDetails.length > 0) {
            this.formatJson(response[appConstants.RESPONSE].centerDetails);
          } else {
            this.displayMessage(
              "Error",
              this.errorlabels.centerDetailsNotAvailable,
              ""
            );
          }
        } else if (response[appConstants.NESTED_ERROR]) {
          this.displayMessage("Error", this.errorlabels.error, "");
        }
      },
      (error) => {
        this.displayMessage("Error", this.errorlabels.error, error);
      }
    );
    this.subscriptions.push(subs);
  }

  tabSelected(selection: string) {
    if (
      (selection === "morning" &&
        this.availabilityData[this.selectedTile].showMorning) ||
      (selection === "afternoon" &&
        this.availabilityData[this.selectedTile].showAfternoon)
    ) {
      this.activeTab = selection;
      console.log(this.availabilityData[this.selectedTile]);
      console.log(
        this.availabilityData[this.selectedTile].timeSlots.filter(
          (day) => day.tag === this.activeTab
        ).length
      );
      this.availabilityData[this.selectedTile].timeSlots.filter(
        (day) => day.tag === this.activeTab
      ).length > 0
        ? (this.showsNamesContainer = true)
        : (this.showsNamesContainer = false);
      console.log(this.showsNamesContainer);
    }
  }

  getNames(): string {
    const x = [];

    this.deletedNames.forEach((name) => {
      x.push(name.fullName);
    });

    return x.join(", ");
  }

  makeBooking(): void {
    this.canDeactivateFlag = false;
    this.disableContinueButton = true;
    this.bookingDataList = [];
    this.availabilityData.forEach((data) => {
      data.timeSlots.forEach((slot) => {
        if (slot.names.length !== 0) {
          slot.names.forEach((name) => {
            const bookingData = new BookingModel(
              name.preRegId,
              this.registrationCenter.toString(),
              data.date,
              slot.fromTime,
              slot.toTime
            );
            this.bookingDataList.push(bookingData);
          });
        }
      });
    });
    if (this.bookingDataList.length === 0) {
      this.disableContinueButton = false;
      return;
    }
    const obj = {
      bookingRequest: this.bookingDataList,
    };
    const request = new RequestModel(appConstants.IDS.booking, obj);
    if (this.deletedNames.length !== 0) {
      const data = {
        case: "CONFIRMATION",
        title: "",
        message:
          this.secondaryLanguagelabels.deletedApplicant1[0] +
          ' - "' +
          this.getNames() +
          ' ". ' +
          this.secondaryLanguagelabels.deletedApplicant1[1] +
          "?",
        yesButtonText: this.secondaryLanguagelabels.yesButtonText,
        noButtonText: this.secondaryLanguagelabels.noButtonText,
      };
      const dialogRef = this.dialog.open(DialougComponent, {
        width: "350px",
        data: data,
        disableClose: true,
      });
      const subs = dialogRef.afterClosed().subscribe((selectedOption) => {
        if (selectedOption) {
          this.bookingOperation(request);
        } else {
          this.disableContinueButton = false;
          return;
        }
      });
      this.subscriptions.push(subs);
    } else {
      this.bookingOperation(request);
    }
  }

  bookingOperation(request) {
    const subs = this.dataService.makeBooking(request).subscribe(
      (response) => {
        if (response[appConstants.RESPONSE]) {
          const data = {
            case: "MESSAGE",
            title: this.secondaryLanguagelabels.title_success,
            message: this.secondaryLanguagelabels.msg_success,
          };
          this.dialog
            .open(DialougComponent, {
              width: "350px",
              data: data,
            })
            .afterClosed()
            .subscribe(() => {
              this.temp.forEach((name) => {
                const booking = this.bookingDataList.filter(
                  (element) => element.preRegistrationId === name.preRegId
                );
              });
              this.bookingService.setSendNotification(true);
              const url = Utils.getURL(this.router.url, "summary", 3);
              if (this.router.url.includes("multiappointment")) {
                this.router.navigateByUrl(
                  url + `/multiappointment/acknowledgement`
                );
              } else {
                this.router.navigateByUrl(
                  url + `/${this.preRegId[0]}/acknowledgement`
                );
              }
            });
        } else if (
          response[appConstants.NESTED_ERROR][0][appConstants.ERROR_CODE] ===
          appConstants.ERROR_CODES.timeExpired
        ) {
          let timespan = response[appConstants.NESTED_ERROR][0].message.match(
            /\d+/g
          );
          let errorMessage =
            this.errorlabels.timeExpired_1 +
            timespan[0] +
            this.errorlabels.timeExpired_2;
          this.displayMessage("Error", errorMessage, {
            error: response,
          });
        } else {
          this.displayMessage("Error", this.errorlabels.error, {
            error: response,
          });
        }
      },
      (error) => {
        this.displayMessage("Error", this.errorlabels.error, error);
      }
    );
    this.subscriptions.push(subs);
  }

  displayMessage(title: string, message: string, error: any) {
    this.spinner = false;
    this.disableContinueButton = false;
    if (
      error &&
      error[appConstants.ERROR] &&
      error[appConstants.ERROR][appConstants.NESTED_ERROR] &&
      error[appConstants.ERROR][appConstants.NESTED_ERROR][0].errorCode ===
        appConstants.ERROR_CODES.tokenExpired
    ) {
      message = this.errorlabels.tokenExpiredLogout;
      title = "";
    } else if (
      error &&
      error[appConstants.ERROR] &&
      error[appConstants.ERROR][appConstants.NESTED_ERROR][0].errorCode ===
        appConstants.ERROR_CODES.slotNotAvailable
    ) {
      message = this.errorlabels.slotNotAvailable;
    }
    const messageObj = {
      case: "MESSAGE",
      title: title,
      message: message,
    };
    const dialogRef = this.openDialog(messageObj, "250px");
    const subs = dialogRef.afterClosed().subscribe(() => {
      if (
        error &&
        error[appConstants.ERROR] &&
        error[appConstants.ERROR][appConstants.NESTED_ERROR][0].errorCode ===
          appConstants.ERROR_CODES.slotNotAvailable
      ) {
        this.canDeactivateFlag = false;
        if (this.router.url.includes("multiappointment")) {
          this.router.navigateByUrl(
            `${this.primaryLangCode}/pre-registration/booking/multiappointment/pick-center`
          );
        } else {
          this.router.navigateByUrl(
            `${this.primaryLangCode}/pre-registration/booking/${this.preRegId[0]}/pick-center`
          );
        }
      }
      if (this.errorlabels.centerDetailsNotAvailable === messageObj.message) {
        this.canDeactivateFlag = false;
        if (this.router.url.includes("multiappointment")) {
          this.router.navigateByUrl(
            `${this.primaryLangCode}/pre-registration/booking/multiappointment/pick-center`
          );
        } else {
          this.router.navigateByUrl(
            `${this.primaryLangCode}/pre-registration/booking/${this.preRegId[0]}/pick-center`
          );
        }
      }
    });
    this.subscriptions.push(subs);
  }

  openDialog(data, width) {
    const dialogRef = this.dialog.open(DialougComponent, {
      width: width,
      data: data,
    });
    return dialogRef;
  }

  navigateDashboard() {
    this.canDeactivateFlag = false;
    this.router.navigate([`${this.primaryLangCode}/dashboard`]);
  }

  navigateBack() {
    this.canDeactivateFlag = false;
    const url = Utils.getURL(this.router.url, "pick-center", 1);
    this.router.navigateByUrl(url);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
