import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestModel } from '../models/request.model';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class BulkuploadService {

  constructor(private http: HttpClient, private appService: AppConfigService) { }

  private BASE_URL = this.appService.getConfig().baseUrl;

  getUploadDetails(request: RequestModel, bulkuploadtype : any, pageStart : any, pageFetch : any): Observable<any> {
    return this.http.get(this.BASE_URL + 'admin'  + '/bulkupload/getAllTransactions?category='+bulkuploadtype+'&pageNumber='+Number(pageStart)+'&pageSize='+Number(pageFetch));
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