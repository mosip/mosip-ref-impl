import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestModel } from '../models/request.model';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class KeymanagerService {

  constructor(private http: HttpClient, private appService: AppConfigService) { }

  private BASE_URL = this.appService.getConfig().baseUrl;

  getCertificate(request: RequestModel, applicationId : any, pageStart : any, pageFetch : any, referenceId : any): Observable<any> {
    return this.http.get(this.BASE_URL + 'keymanager'  + '/getCertificate?applicationId='+applicationId+'&referenceId='+referenceId);
  }


  uploadOtherDomainCertificate(data: any): Observable<any> {
    return this.http.post(
      this.BASE_URL  + 'keymanager'  + '/uploadOtherDomainCertificate',
      data
    );
  }

  uploadCertificate(data: any): Observable<any> {
    return this.http.post(
      this.BASE_URL  + 'keymanager'  + '/uploadCertificate',
      data
    );
  }

  generateMasterkey(data: any, ObjectType : any): Observable<any> {
    return this.http.post(
      this.BASE_URL  + 'keymanager'  + '/generateMasterKey' + '/' + ObjectType,
      data
    );
  }

  generateCSR(data: any): Observable<any> {
    return this.http.post(
      this.BASE_URL  + 'keymanager'  + '/generateCSR',
      data
    );
  }
}
