import { Component, OnInit, Input } from "@angular/core";
import { RequestModel } from "src/app/shared/models/request-model/RequestModel";
import * as appConstants from "../../app.constants";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { AuthService } from "../auth.service";
@Component({
  selector: "app-captcha",
  templateUrl: "./captcha.component.html",
  styleUrls: ["./captcha.component.css"],
})
export class CaptchaComponent implements OnInit {
  @Input() captchaSiteKey: string;
  captchaSucess: boolean;
  showCaptcha = true;
  captchaError: boolean;
  constructor(
    private dataService: DataStorageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log(this.captchaSiteKey);
  }

  recaptcha(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
    let data = {
      captchaToken: "",
    };
    data.captchaToken = captchaResponse;
    let obj = new RequestModel(appConstants.IDS.captchaId, data, "");
    if (data.captchaToken != null) {
      this.dataService.verifyGCaptcha(obj).subscribe((response) => {
        console.log(response);
        if (response["response"]) {
          this.captchaSucess = response["response"].success;
          if (this.captchaSucess) {
            console.log("Captcha Authentication :" + this.captchaSucess);
            this.authService.setCaptchaAuthenticate(this.captchaSucess);
          } else {
            this.authService.setCaptchaAuthenticate(false);
          }
        } else {
          grecaptcha.reset();
          this.authService.setCaptchaAuthenticate(false);
        }
      });
    } else {
      this.captchaSucess = false;
      this.authService.setCaptchaAuthenticate(this.captchaSucess);
    }
  }
  recaptchaError(event) {
    console.log(event);
    alert(event);
  }
}
