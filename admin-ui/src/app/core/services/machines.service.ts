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
export class MachineService {

  constructor(private http: HttpClient, private appService: AppConfigService) { }

  private BASE_URL = this.appService.getConfig().baseUrl;

  getRegistrationMachinesDetails(request: RequestModel): Observable<any> {
    console.log(JSON.stringify(request));
    console.log(JSON.stringify(URL));
    return this.http.post(this.BASE_URL + URL.machines, request, httpOptions);
  }
}
