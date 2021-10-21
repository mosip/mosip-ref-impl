import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  appConfig: any;

  constructor(private http: HttpClient) { }

  async loadAppConfig() {
    this.appConfig = await this.http.get('./assets/config.json').toPromise();
    if(this.appConfig.primaryLangCode){
    	this.http.get(this.appConfig.baseUrl + 'masterdata/applicationconfigs').subscribe(
	      response => {
	        this.appConfig["primaryLangCode"]= response["response"]["primaryLangCode"];
	        this.appConfig["secondaryLangCode"] = response["response"]["secondaryLangCode"];     
		this.appConfig["version"]= response["response"]["version"];
	      },
	      error => {
	        console.log(error);
	      }
	    );
    }
  }

  getConfig() {
    return this.appConfig;
  }
}
