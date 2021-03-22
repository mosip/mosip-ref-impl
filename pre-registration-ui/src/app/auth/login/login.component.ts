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
import LanguageFactory from "../../../assets/i18n";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  languages: string[] = [];
  inputPlaceholderContact = "Email ID or Phone Number";
  inputPlaceholderOTP = "Enter OTP";
  disableBtn = false;
  timer: any;
  inputOTP: string;
  inputContactDetails = "";
  secondaryLangCode = "";
  secondaryDir = "";
  selectedLanguage = "";
  langCode = "";
  dir = "";
  primaryLangFromConfig = "";
  primaryLang = "";
  secondaryLangFromConfig = "";
  defaultLangCode = appConstants.DEFAULT_LANG_CODE;
  secondaryLang = "";
  showSendOTP = true;
  showResend = false;
  showVerify = false;
  showContactDetails = true;
  showOTP = false;
  disableVerify = false;
  secondaryLanguagelabels: any;
  loggedOutLang: string;
  errorMessage: string;
  minutes: string;
  seconds: string;
  showSpinner = true;
  validationMessages = {};
  textDir = localStorage.getItem("dir");
  LANGUAGE_ERROR_TEXT =
    "The system has encountered a technical error. Administrator to setup the necessary language configuration(s)";
  siteKey: any;
  enableCaptcha = false;
  enableSendOtp: boolean;
  showCaptcha: boolean = true;
  captchaError: boolean;
  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private dialog: MatDialog,
    private dataService: DataStorageService,
    private regService: RegistrationService,
    private configService: ConfigService
  ) {
    translate.setDefaultLang("eng");
    localStorage.clear();
  }

  ngOnInit() {
    localStorage.setItem("langCode", "eng");
    this.showSpinner = true;
    this.loadConfigs();
    if (this.authService.isAuthenticated()) {
      this.authService.onLogout();
    }
  }

  loadValidationMessages() {
    let factory = new LanguageFactory(localStorage.getItem("langCode"));
    let response = factory.getCurrentlanguage();
    this.validationMessages = response["login"];
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

  loadConfigs() {
    this.dataService.getConfig().subscribe(
      (response) => {
        this.configService.setConfig(response);
        this.setTimer();
        this.loadLanguagesWithConfig();
        this.loadRecaptchaSiteKey();
      },
      (error) => {
        this.showErrorMessage();
      }
    );
  }

  loadRecaptchaSiteKey() {
    if (
      this.configService.getConfigByKey("enable-captcha") === "false" ||
      this.configService.getConfigByKey("enable-captcha") === undefined
    ) {
      this.enableCaptcha = false;
    } else if (this.configService.getConfigByKey("enable-captcha") === "true") {
      this.enableCaptcha = true;
    }
    console.log(this.enableCaptcha + typeof this.enableCaptcha);
    if (!this.enableCaptcha) {
      this.enableSendOtp = true;
    }
    this.siteKey = this.configService.getConfigByKey(
      appConstants.CONFIG_KEYS.google_recaptcha_site_key
    );
  }

  loadLanguagesWithConfig() {
    this.primaryLangFromConfig = this.configService.getConfigByKey(
      appConstants.CONFIG_KEYS.mosip_primary_language
    );
    this.secondaryLangFromConfig = this.configService.getConfigByKey(
      appConstants.CONFIG_KEYS.mosip_secondary_language
    );
    if (
      !this.primaryLangFromConfig ||
      !this.secondaryLangFromConfig ||
      this.primaryLangFromConfig === "" ||
      this.secondaryLangFromConfig === ""
    ) {
      const message = {
        case: "MESSAGE",
        message: this.LANGUAGE_ERROR_TEXT,
      };
      this.dialog.open(DialougComponent, {
        width: "350px",
        data: message,
        disableClose: true,
      });
    }

    this.primaryLang = this.primaryLangFromConfig;
    this.secondaryLang = this.secondaryLangFromConfig;

    this.setLanguageDirection(
      this.primaryLangFromConfig,
      this.secondaryLangFromConfig
    );
    localStorage.setItem("langCode", this.primaryLangFromConfig);
    localStorage.setItem("secondaryLangCode", this.secondaryLangFromConfig);
    this.translate.use(this.primaryLang);
    this.selectedLanguage =
      appConstants.languageMapping[this.primaryLang].langName;
    if (
      appConstants.languageMapping[this.primaryLangFromConfig] &&
      appConstants.languageMapping[this.secondaryLangFromConfig]
    ) {
      this.languages.push(
        appConstants.languageMapping[this.primaryLangFromConfig].langName
      );
      if(this.primaryLang !== this.secondaryLang){
        this.languages.push(
          appConstants.languageMapping[this.secondaryLangFromConfig].langName
        );
      }
    }
    this.translate.addLangs([
      this.primaryLangFromConfig,
      this.secondaryLangFromConfig,
    ]);
    this.showSpinner = false;
    this.loadValidationMessages();
  }

  setLanguageDirection(primaryLang: string, secondaryLang: string) {
    const ltrLangs = this.configService
      .getConfigByKey(appConstants.CONFIG_KEYS.mosip_left_to_right_orientation)
      .split(",");
    if (ltrLangs.includes(primaryLang)) {
      this.dir = "ltr";
    } else {
      this.dir = "rtl";
    }
    if (ltrLangs.includes(secondaryLang)) {
      this.secondaryDir = "ltr";
    } else {
      this.secondaryDir = "rtl";
    }
    localStorage.setItem("dir", this.dir);
    localStorage.setItem("secondaryDir", this.secondaryDir);
    this.textDir = localStorage.getItem("dir");
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
    if (
      this.selectedLanguage !==
      appConstants.languageMapping[this.primaryLangFromConfig].langName
    ) {
      this.secondaryLang = this.configService.getConfigByKey(
        appConstants.CONFIG_KEYS.mosip_primary_language
      );
      this.primaryLang = this.configService.getConfigByKey(
        appConstants.CONFIG_KEYS.mosip_secondary_language
      );
      this.setLanguageDirection(this.primaryLang, this.secondaryLang);
      this.authService.primaryLang = this.primaryLang;
      localStorage.setItem("langCode", this.primaryLang);
      localStorage.setItem("secondaryLangCode", this.secondaryLang);
      this.router.navigate([localStorage.getItem("langCode")]);
    } else {
      this.primaryLang = this.configService.getConfigByKey(
        appConstants.CONFIG_KEYS.mosip_primary_language
      );
      this.secondaryLang = this.configService.getConfigByKey(
        appConstants.CONFIG_KEYS.mosip_secondary_language
      );
      this.authService.primaryLang = this.primaryLang;
      this.setLanguageDirection(this.primaryLang, this.secondaryLang);
      localStorage.setItem("langCode", this.primaryLang);
      localStorage.setItem("secondaryLangCode", this.secondaryLang);
      this.router.navigate([localStorage.getItem("langCode")]);
    }
    this.translate.use(localStorage.getItem("langCode"));
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
        .sendOtp(this.inputContactDetails,this.primaryLang)
        .subscribe((response) => {});

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
              this.router.navigate([this.primaryLang, "dashboard"]);
            } else {
              this.disableVerify = false;
              this.showOtpMessage();
            }
          },
          (error) => {
            this.disableVerify = false;
            this.showErrorMessage();
          }
        );
    }
  }

  showOtpMessage() {
    this.inputOTP = "";
    let factory = new LanguageFactory(localStorage.getItem("langCode"));
    let response = factory.getCurrentlanguage();
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
    let factory = new LanguageFactory(localStorage.getItem("langCode"));
    let response = factory.getCurrentlanguage();
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
