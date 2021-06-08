import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { DialougComponent } from "src/app/shared/dialoug/dialoug.component";
import { MatDialog } from "@angular/material";
import { AuthService } from "../auth.service";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { RegistrationService } from "src/app/core/services/registration.service";
import { ConfigService } from "src/app/core/services/config.service";
import * as appConstants from "../../app.constants";
import Utils from "src/app/app.util";
import moment from 'moment';
import stubConfig from "../../../assets/stub-config.json";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  appVersion;
  disableBtn = false;
  timer: any;
  inputOTP: string;
  inputContactDetails = "";
  selectedLanguage = "";
  dir = "ltr";
  showSendOTP = true;
  showResend = false;
  showVerify = false;
  showContactDetails = true;
  showOTP = false;
  disableVerify = false;
  Languagelabels: any;
  loggedOutLang: string;
  errorMessage: string;
  loadingMessage: string;
  minutes: string;
  seconds: string;
  showSpinner = true;
  showLanguageDropDown = true;
  validationMessages = {};
  textDir = localStorage.getItem("dir");
  siteKey: any;
  enableCaptcha = false;
  enableSendOtp: boolean;
  showCaptcha: boolean = true;
  captchaError: boolean;
  mandatoryLanguages = [];
  optionalLanguages = [];
  minLanguage;
  maxLanguage;
  languageSelectionArray = [];
  userPreferredLanguage: string;
  langCode: string;
  LanguageCodelabels;
  languageCodeValue: any = [];
  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private dialog: MatDialog,
    private dataService: DataStorageService,
    private regService: RegistrationService,
    private configService: ConfigService
  ) {
    //localStorage.clear();
    clearInterval(this.timer);
  }

  async ngOnInit() {
    await this.loadDefaultConfig();
    await this.loadConfigs();
    if (this.authService.isAuthenticated()) {
      this.authService.onLogout();
    }
    localStorage.setItem("dir", this.dir);
  }

  async loadDefaultConfig() {
    return new Promise((resolve, reject) => {
      this.dataService.getI18NLanguageFiles("default").subscribe((response) => {
        this.LanguageCodelabels = response["languages"];
        resolve(true);
      });
  });
  }

  async loadConfigs() {
    this.dataService.getConfig().subscribe((response) => {
      //response = stubConfig;
      this.configService.setConfig(response);
      this.appVersion = this.configService.getConfigByKey('preregistration.ui.version');
      //this.setTimer();
      this.isCaptchaEnabled();
      this.loadLanguagesWithConfig();
      if (!localStorage.getItem("langCode")) {
        localStorage.setItem("langCode", this.languageSelectionArray[0]);
      }
      if (!this.router.url.includes(`${localStorage.getItem("langCode")}`)) {
        this.router.navigate([`${localStorage.getItem("langCode")}`]);
      }
      this.selectedLanguage = localStorage.getItem("langCode");
      this.setLanguageDirection(this.selectedLanguage);
      this.authService.userPreferredLang = this.selectedLanguage;
      this.userPreferredLanguage = this.selectedLanguage;
      localStorage.setItem("userPrefLanguage", this.userPreferredLanguage);
      this.translate.use(this.userPreferredLanguage);
      this.loadValidationMessages();
      this.showSpinner = false;
      if (this.router.url.includes(`${localStorage.getItem("langCode")}`)) {
        console.log("calling handleBrowserReload");
        this.handleBrowserReload();
      }   
    });
  }

  handleBrowserReload() {
    clearInterval(this.timer);
    const otp_sent_time = localStorage.getItem("otp_sent_time");
    const user_email_or_phone = localStorage.getItem("user_email_or_phone");
    console.log(`otp_sent_time: ${otp_sent_time}`);
    if (otp_sent_time && user_email_or_phone) {
      let otpSentTime = moment(otp_sent_time).toISOString();
      console.log(`otpSentTime: ${otpSentTime}`);
      let currentTime = moment().toISOString();
      console.log(`currentTime: ${currentTime}`);
      let otpExpiryIntervalInSeconds = Number(
        this.configService.getConfigByKey(
          appConstants.CONFIG_KEYS.mosip_kernel_otp_expiry_time
        )
      );
      if (isNaN(otpExpiryIntervalInSeconds)) {
        otpExpiryIntervalInSeconds = 120; //2 mins by default
      }
      console.log(`otpExpiryIntervalInSeconds: ${otpExpiryIntervalInSeconds}`);
      var timeLapsedInSeconds = moment(currentTime).diff(moment(otpSentTime), 'seconds');
      console.log(`timeLapsedInSeconds: ${timeLapsedInSeconds}`);
      if (timeLapsedInSeconds <= otpExpiryIntervalInSeconds) {
        console.log("otp interval not yet expired");
        let newOtpIntervalInSeconds = otpExpiryIntervalInSeconds - timeLapsedInSeconds;
        console.log(`newOtpIntervalInSeconds: ${newOtpIntervalInSeconds}`);
        this.errorMessage = ""; 
        this.inputOTP = "";
        //this.showResend = false;
        this.showOTP = true;
        this.showSendOTP = false;
        this.showContactDetails = false;
        this.inputContactDetails = user_email_or_phone;
        let mins = 0;
        if (newOtpIntervalInSeconds >= 60) {
          mins = newOtpIntervalInSeconds / 60;
          mins = Math.floor(mins);
        } 
        if (mins < 10) {
          this.minutes = "0" + mins;
        } else {
          this.minutes = String(mins);
        }
        let secs = newOtpIntervalInSeconds % 60;
        if (secs < 10) {
          this.seconds = "0" + secs;
        } else {
          this.seconds = String(secs);
        }
        this.timer = setInterval(this.timerFn, 1000);
      } else {
        localStorage.removeItem("otp_sent_time");
        localStorage.removeItem("user_email_or_phone");
        console.log("otp interval expired");
      }
    }
  }

  loadLanguagesWithConfig() {
    this.mandatoryLanguages = this.configService.getConfigByKey('mosip.mandatory-languages').split(',');
    this.mandatoryLanguages = this.mandatoryLanguages.filter(item => item != "");
    this.optionalLanguages = this.configService.getConfigByKey('mosip.optional-languages').split(',');
    this.optionalLanguages = this.optionalLanguages.filter(item => item != "");
    this.minLanguage = Number(this.configService.getConfigByKey('mosip.min-languages.count'));
    this.maxLanguage = Number(this.configService.getConfigByKey('mosip.max-languages.count'));
    this.languageSelectionArray = [
      ...this.mandatoryLanguages,
      ...this.optionalLanguages,
    ];
    this.maxLanguage == 1
      ? (this.showLanguageDropDown = false)
      : (this.showLanguageDropDown = true);
    localStorage.setItem(
      "availableLanguages",
      JSON.stringify(this.languageSelectionArray)
    );
    this.languageSelectionArray.forEach(async (language) => {
      let localeId = language.substring(0, 2);
      if (this.LanguageCodelabels[language]) {
        localeId = this.LanguageCodelabels[language].locale;
        if (localeId && localeId.indexOf("_") != -1) {
          localeId = localeId.split("_")[0];
        }
        if (localeId) {
          if (localStorage.getItem(localeId) == null) {
            console.log(`importing localeId: ${localeId}`);
            await Utils.localeInitializer(localeId);
          }
        }
      }
    });
    this.prepareDropdownLabelArray();
  }

  prepareDropdownLabelArray() {
    this.languageSelectionArray.forEach((language) => {
      let codevalue = {
        code: language,
        value: this.LanguageCodelabels[language].nativeName,
        locale: this.LanguageCodelabels[language].locale
      };
      this.languageCodeValue.push(codevalue);
    });
    localStorage.setItem(
      "languageCodeValue",
      JSON.stringify(this.languageCodeValue)
    );
  }

  isCaptchaEnabled() {
    if (
      this.configService.getConfigByKey("enable-captcha") === "false" ||
      this.configService.getConfigByKey("enable-captcha") === undefined
    ) {
      this.enableCaptcha = false;
    } else if (this.configService.getConfigByKey("enable-captcha") === "true") {
      this.enableCaptcha = true;
      this.loadRecaptchaSiteKey();
    }
    if (!this.enableCaptcha) {
      this.enableSendOtp = true;
    }
  }

  loadRecaptchaSiteKey() {
    this.siteKey = this.configService.getConfigByKey(
      appConstants.CONFIG_KEYS.google_recaptcha_site_key
    );
  }

  loadValidationMessages() {
    this.dataService
      .getI18NLanguageFiles(localStorage.getItem("langCode"))
      .subscribe((response) => {
        console.log(localStorage.getItem("langCode"));
        console.log(response);
        this.Languagelabels = response;
        this.validationMessages = this.Languagelabels["login"];
      });
  }

  setLanguageDirection(userSelectedLanguage) {
    const ltrLangs = this.configService
      .getConfigByKey(appConstants.CONFIG_KEYS.mosip_left_to_right_orientation)
      .split(",");
    if (ltrLangs.includes(userSelectedLanguage)) {
      this.dir = "ltr";
    } else {
      this.dir = "rtl";
    }
    localStorage.setItem("dir", this.dir);
  }

  setTimer() {
    const time = Number(
      this.configService.getConfigByKey(
        appConstants.CONFIG_KEYS.mosip_kernel_otp_expiry_time
      )
    );
    
    if (!isNaN(time)) {
      const minutes = time / 60;
      const seconds = time % 60;
      if (minutes < 10) {
        this.minutes = "0" + minutes;
      } else {
        this.minutes = String(minutes);
      }
      if (seconds < 10) {
        this.seconds = "0" + seconds;
      } else {
        this.seconds = String(seconds);
      }
    } else {
      this.minutes = "02";
      this.seconds = "00";
    }
  }

  changeLanguage(): void {
    this.setLanguageDirection(this.selectedLanguage);
    this.authService.userPreferredLang = this.selectedLanguage;
    this.userPreferredLanguage = this.selectedLanguage;
    localStorage.setItem("userPrefLanguage", this.selectedLanguage);
    localStorage.setItem("langCode", this.selectedLanguage);
    this.translate.use(this.userPreferredLanguage);
    this.router.navigate([this.userPreferredLanguage]);
    this.loadValidationMessages();
    this.errorMessage = "";
  }

  showVerifyBtn() {
    if (
      this.inputOTP.length ===
      Number(
        this.configService.getConfigByKey(
          appConstants.CONFIG_KEYS.mosip_kernel_otp_default_length
        )
      )
    ) {
      this.errorMessage = "";
      this.showVerify = true;
      //this.showResend = false;
    } else {
      //this.showResend = false;
      this.showVerify = false;
    }
  }
  timerFn = () => {
    let secValue, minValue = 0;
    if (document.getElementById("secondsSpan") && document.getElementById("secondsSpan").innerText 
    && document.getElementById("minutesSpan") && document.getElementById("minutesSpan").innerText) {
      secValue = Number(document.getElementById("secondsSpan").innerText);
      minValue = Number(document.getElementById("minutesSpan").innerText);  
    }
    else {
      secValue = Number(this.seconds);
      minValue = Number(this.minutes);
      if (document.getElementById("timer")) {
        document.getElementById("timer").style.visibility = "visible";
      }
      if (document.getElementById("secondsSpan")) {
        document.getElementById("secondsSpan").innerText = this.seconds;
      }
      if (document.getElementById("minutesSpan")) {
        document.getElementById("minutesSpan").innerText = this.minutes; 
      }
    }
    if (secValue === 0) {
      secValue = 60;
      if (minValue === 0) {
        // redirecting to initial phase on completion of timer
        this.showContactDetails = true;
        this.showSendOTP = true;
        //this.showResend = true;
        this.showOTP = false;
        this.showVerify = false;
        if (this.enableCaptcha) {
          this.showCaptcha = true;
          this.authService.setCaptchaAuthenticate(false);
        }
        if (document.getElementById("minutesSpan")) {
          document.getElementById("minutesSpan").innerText = this.minutes;
        }
        if (document.getElementById("timer")) {
          document.getElementById("timer").style.visibility = "hidden";
        }
        clearInterval(this.timer);
        return;
      }
      if (document.getElementById("minutesSpan")) {
        document.getElementById("minutesSpan").innerText = "0" + (minValue - 1);
      }  
    }
    if (document.getElementById("secondsSpan")) {
      if (secValue === 10 || secValue < 10) {
        document.getElementById("secondsSpan").innerText = "0" + --secValue;
      } else {
        document.getElementById("secondsSpan").innerText = --secValue + "";
      }
    }  
  };

  submit() {
    this.loginIdValidator();
    if (
      this.enableCaptcha &&
      this.authService.isCaptchaAuthenticated() &&
      this.errorMessage == ""
    ) {
      this.showCaptcha = false;
      this.captchaError = false;
    } else if (
      this.enableCaptcha &&
      this.authService.isCaptchaAuthenticated() &&
      this.errorMessage != ""
    ) {
      this.showCaptcha = true;
    } else if (
      this.enableCaptcha &&
      !this.authService.isCaptchaAuthenticated() &&
      this.errorMessage == ""
    ) {
      this.captchaError = true;
    }
    if (
      (this.showSendOTP || this.showResend) &&
      this.errorMessage == "" &&
      ((this.enableCaptcha && this.authService.isCaptchaAuthenticated()) ||
        this.enableSendOtp)
    ) {
      this.loadingMessage = this.validationMessages["loading"];
      this.dataService
        .sendOtp(this.inputContactDetails, this.userPreferredLanguage)
        .subscribe((response) => {  
          this.loadingMessage = "";
          if (!response["errors"]) {
            let otpSentTime = response["responsetime"];
            localStorage.setItem("otp_sent_time", String(otpSentTime));
            localStorage.setItem("user_email_or_phone", this.inputContactDetails);
            this.errorMessage = undefined; 
            this.inputOTP = "";
            //this.showResend = false;
            this.showOTP = true;
            this.showSendOTP = false;
            this.showContactDetails = false;
            // initial set up for timer
            this.setTimer();
            if (document.getElementById("timer")) {
              document.getElementById("timer").style.visibility = "visible";
            }
            if (document.getElementById("secondsSpan")) {
              document.getElementById("secondsSpan").innerText = this.seconds;
            }
            if (document.getElementById("minutesSpan")) {
              document.getElementById("minutesSpan").innerText = this.minutes;  
            }
            this.timer = setInterval(this.timerFn, 1000);
          } else {
            this.errorMessage = this.validationMessages["serverUnavailable"];
          }
      },(error) => {  
        clearInterval(this.timer);
        console.log(error);
        this.loadingMessage = "";
        this.errorMessage = this.validationMessages["serverUnavailable"];
    });    
      // dynamic update of button text for Resend and Verify
    } else if (this.showVerify && this.errorMessage == "") {
      this.disableVerify = true;
      this.dataService
        .verifyOtp(this.inputContactDetails, this.inputOTP)
        .subscribe(
          (response) => {
            if (!response["errors"]) {
              clearInterval(this.timer);
              localStorage.setItem("loggedIn", "true");
              this.authService.setToken();
              this.regService.setLoginId(this.inputContactDetails);
              localStorage.setItem("loginId", this.inputContactDetails);
              this.disableVerify = false;
              this.router.navigate([this.userPreferredLanguage, "dashboard"]);
            } else {
              this.showVerify = false;
              this.disableVerify = false;
              this.showOtpMessage();
            }
          },
          () => {
            this.disableVerify = false;
            this.showVerify = false;
            this.showErrorMessage();
          }
        );
    }
  }

  loginIdValidator() {
    this.errorMessage = "";

    const modes = this.configService.getConfigByKey(
      appConstants.CONFIG_KEYS.mosip_login_mode
    );
    const emailRegex = new RegExp(
      this.configService.getConfigByKey(
        appConstants.CONFIG_KEYS.mosip_regex_email
      )
    );
    const phoneRegex = new RegExp(
      this.configService.getConfigByKey(
        appConstants.CONFIG_KEYS.mosip_regex_phone
      )
    );
    if (modes === "email,mobile") {
      if (
        !(
          emailRegex.test(this.inputContactDetails) ||
          phoneRegex.test(this.inputContactDetails)
        )
      ) {
        this.errorMessage = this.validationMessages["invalidInput"];
      }
    } else if (modes === "email") {
      if (!emailRegex.test(this.inputContactDetails)) {
        this.errorMessage = this.validationMessages["invalidEmail"];
      }
    } else if (modes === "mobile") {
      if (!phoneRegex.test(this.inputContactDetails)) {
        this.errorMessage = this.validationMessages["invalidMobile"];
      }
    }
  }

  showOtpMessage() {
    this.inputOTP = "";
    let response = this.Languagelabels;
    console.log(response);
    let otpmessage = response["message"]["login"]["msg3"];
    const message = {
      case: "MESSAGE",
      message: otpmessage,
    };
    this.dialog.open(DialougComponent, {
      width: "350px",
      data: message,
    });
  }

  showErrorMessage() {
    let response = this.Languagelabels;
    let errormessage = response["error"]["error"];
    const message = {
      case: "MESSAGE",
      message: errormessage,
    };
    this.dialog.open(DialougComponent, {
      width: "350px",
      data: message,
    });
  }
}
