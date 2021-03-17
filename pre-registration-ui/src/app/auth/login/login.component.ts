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
import stubConfig from "../../../assets/stub-config.json";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  appVersion;
  inputPlaceholderContact = "Email ID or Phone Number";
  inputPlaceholderOTP = "Enter OTP";
  disableBtn = false;
  timer: any;
  inputOTP: string;
  inputContactDetails = "";
  selectedLanguage = "";
  dir = "ltr";
  secondaryLang = "";
  showSendOTP = true;
  showResend = false;
  showVerify = false;
  showContactDetails = true;
  showOTP = false;
  disableVerify = false;
  Languagelabels: any;
  loggedOutLang: string;
  errorMessage: string;
  minutes: string;
  seconds: string;
  showSpinner = true;
  showLanguageDropDown = true;
  validationMessages = {};
  textDir = localStorage.getItem("dir");
  LANGUAGE_ERROR_TEXT =
    "The system has encountered a technical error. Administrator to setup the necessary language configuration(s)";
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
    localStorage.clear();
  }

  ngOnInit() {
    this.loadDefaultConfig();
    this.loadConfigs();
    if (this.authService.isAuthenticated()) {
      this.authService.onLogout();
    }
    localStorage.setItem("dir", this.dir);
  }

  loadDefaultConfig() {
    this.dataService.getI18NLanguageFiles("default").subscribe((response) => {
      this.LanguageCodelabels = response["languages"];
    });
  }

  loadConfigs() {
    this.dataService.getConfig().subscribe((response) => {
      //response = stubConfig;
      this.configService.setConfig(response);
      this.appVersion = this.configService.getConfigByKey('preregistration.ui.version');
      this.setTimer();
      this.isCaptchaEnabled();
      this.loadLanguagesWithConfig();
      localStorage.setItem("langCode", this.languageSelectionArray[0]);
      this.router.navigate([`${localStorage.getItem("langCode")}`]);
      this.selectedLanguage = localStorage.getItem("langCode");
      this.setLanguageDirection(this.selectedLanguage);
      this.authService.userPreferredLang = this.selectedLanguage;
      this.userPreferredLanguage = this.selectedLanguage;
      localStorage.setItem("userPrefLanguage", this.userPreferredLanguage);
      this.translate.use(this.userPreferredLanguage);
      this.loadValidationMessages();
      this.showSpinner = false;
    });
  }

  loadLanguagesWithConfig() {
    this.mandatoryLanguages = this.configService.getConfigByKey('mosip.mandatory.languages').split(',');
    this.mandatoryLanguages = this.mandatoryLanguages.filter(item => item != "");
    this.optionalLanguages = this.configService.getConfigByKey('mosip.optional.languages').split(',');
    this.optionalLanguages = this.optionalLanguages.filter(item => item != "");
    this.minLanguage = Number(this.configService.getConfigByKey('mosip.min.languages.count'));
    this.maxLanguage = Number(this.configService.getConfigByKey('mosip.max.languages.count'));
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
    this.prepareDropdownLabelArray();
  }

  prepareDropdownLabelArray() {
    this.languageSelectionArray.forEach((language) => {
      let codevalue = {
        code: language,
        value: this.LanguageCodelabels[language].nativeName,
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
      this.showVerify = true;
      this.showResend = false;
    } else {
      this.showResend = true;
      this.showVerify = false;
    }
  }

  submit(): void {
    this.loginIdValidator();
    if (
      this.enableCaptcha &&
      this.authService.isCaptchaAuthenticated() &&
      this.errorMessage === undefined
    ) {
      this.showCaptcha = false;
      this.captchaError = false;
    } else if (
      this.enableCaptcha &&
      this.authService.isCaptchaAuthenticated() &&
      this.errorMessage! == undefined
    ) {
      this.showCaptcha = true;
    } else if (
      this.enableCaptcha &&
      !this.authService.isCaptchaAuthenticated() &&
      this.errorMessage === undefined
    ) {
      this.captchaError = true;
    }
    if (
      (this.showSendOTP || this.showResend) &&
      this.errorMessage === undefined &&
      ((this.enableCaptcha && this.authService.isCaptchaAuthenticated()) ||
        this.enableSendOtp)
    ) {
      console.log("test");
      this.inputOTP = "";
      this.showResend = true;
      this.showOTP = true;
      this.showSendOTP = false;
      this.showContactDetails = false;

      const timerFn = () => {
        let secValue = Number(document.getElementById("secondsSpan").innerText);
        const minValue = Number(
          document.getElementById("minutesSpan").innerText
        );

        if (secValue === 0) {
          secValue = 60;
          if (minValue === 0) {
            // redirecting to initial phase on completion of timer
            this.showContactDetails = true;
            this.showSendOTP = true;
            this.showResend = false;
            this.showOTP = false;
            this.showVerify = false;
            if (this.enableCaptcha) {
              this.showCaptcha = true;
              this.authService.setCaptchaAuthenticate(false);
            }
            document.getElementById("minutesSpan").innerText = this.minutes;
            document.getElementById("timer").style.visibility = "hidden";
            clearInterval(this.timer);
            return;
          }
          document.getElementById("minutesSpan").innerText =
            "0" + (minValue - 1);
        }

        if (secValue === 10 || secValue < 10) {
          document.getElementById("secondsSpan").innerText = "0" + --secValue;
        } else {
          document.getElementById("secondsSpan").innerText = --secValue + "";
        }
      };

      // update of timer value on click of resend
      if (document.getElementById("timer").style.visibility === "visible") {
        document.getElementById("secondsSpan").innerText = this.seconds;
        document.getElementById("minutesSpan").innerText = this.minutes;
      } else {
        // initial set up for timer
        document.getElementById("timer").style.visibility = "visible";
        this.timer = setInterval(timerFn, 1000);
      }

      this.dataService
        .sendOtp(this.inputContactDetails, this.userPreferredLanguage)
        .subscribe(() => {});

      // dynamic update of button text for Resend and Verify
    } else if (this.showVerify && this.errorMessage === undefined) {
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
              this.disableVerify = false;
              this.showOtpMessage();
            }
          },
          () => {
            this.disableVerify = false;
            this.showErrorMessage();
          }
        );
    }
  }

  loginIdValidator() {
    this.errorMessage = undefined;

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
