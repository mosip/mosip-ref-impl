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
export class BulkuploadService {

  constructor(private http: HttpClient, private appService: AppConfigService) { }

  private BASE_URL = this.appService.getConfig().baseUrl;

  getUploadDetails(request: RequestModel, bulkuploadtype : any): Observable<any> {
    return this.http.get(this.BASE_URL + 'admin'  + '/bulkupload/getAllTransactions?category='+bulkuploadtype);
  }

  uploadData(data: any): Observable<any> {
    return this.http.post(
      this.BASE_URL  + 'admin'  + '/bulkupload',
      data
    );
  }

  getTransactionDetails(params: any): Observable<any> {
    return this.http.get(this.BASE_URL + 'admin'  + '/bulkupload/transcation/'+params);
  }
}