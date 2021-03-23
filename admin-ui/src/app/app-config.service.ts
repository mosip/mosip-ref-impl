import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HeaderService } from '../app/core/services/header.service';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  appConfig: any;

  constructor(
    private http: HttpClient,
    private headerService: HeaderService,
  ) { }

  async loadAppConfig() {
    console.log("getUserPreferredLanguage>>>>"+this.headerService.getUserPreferredLanguage());
    this.appConfig = await this.http.get('./assets/config.json').toPromise();
    if(this.appConfig.primaryLangCode){
      this.appConfig["primaryLangCode"]= this.appConfig.primaryLangCode;
      this.appConfig["secondaryLangCode"] = this.appConfig.secondaryLangCode;       
    	/*this.http.get(this.appConfig.baseUrl + 'masterdata/applicationconfigs').subscribe(
	      response => {
	        this.appConfig["primaryLangCode"]= response["response"]["primaryLangCode"];
	        this.appConfig["secondaryLangCode"] = response["response"]["secondaryLangCode"];        
	      },
	      error => {
	        console.log(error);
	      }
	    )*/;
    }
  }

  getConfig() {
    return this.appConfig;
  }
}
