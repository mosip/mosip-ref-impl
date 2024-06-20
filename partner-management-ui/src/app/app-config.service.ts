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
  }

  getConfig() {
    return this.appConfig;
  }
}
