import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestModel } from '../models/request.model';
import { URL } from 'src/app/app.constants';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private http: HttpClient, private appService: AppConfigService) { }

  private BASE_URL = this.appService.getConfig().baseUrl;

  getRegistrationDevicesDetails(request: RequestModel): Observable<any> {
    delete request['request']['languageCode'];
    return this.http.post(this.BASE_URL + URL.devices, request, httpOptions);
  }
}
