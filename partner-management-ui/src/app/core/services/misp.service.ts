import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestModel } from '../models/request.model';
import { URL } from 'src/app/app.constants';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
const httpOptions = {
  headers: new HttpHeaders({
   // 'Access-Control-Allow-Origin':'http://localhost:4200/#/admin/resources/misp/view'
    // 'Content-Type':  'application/json'    
  })
};
@Injectable({
  providedIn: 'root'
})
export class MispService {

  constructor(private http: HttpClient, private appService: AppConfigService) { }

  private BASE_URL = this.appService.getConfig().baseUrl;

  getRegistrationMispDetails(request: RequestModel): Observable<any> {    
    console.log(JSON.stringify(request));
    return this.http.get("/misps",httpOptions);
  }

  getMispDetails(request: RequestModel): Observable<any> {    
    console.log(JSON.stringify(request));
    return this.http.get("/misps/" + request.request.id, httpOptions);
  }
}
