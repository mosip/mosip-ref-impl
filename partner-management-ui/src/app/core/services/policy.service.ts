import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from 'src/app/app-config.service';
import { RequestModel } from '../models/request.model';
import { Observable } from 'rxjs';
import { URL } from 'src/app/app.constants';

const httpOptions = {
    headers:new HttpHeaders({})
};

@Injectable({
    providedIn: 'root'
})

export class PolicyService{

    constructor(private http:HttpClient, private appService:AppConfigService){}

    private BASE_URL = this.appService.getConfig().baseUrl;

    getPolicyDetails(request: RequestModel): Observable<any> {    
        console.log(JSON.stringify(request));
        return this.http.get("/policies",httpOptions);
    }

    getPolicyInfo(request: RequestModel): Observable<any> {    
        console.log(JSON.stringify(request));
        return this.http.get("/policies/" + request.request.id, httpOptions);
      }
      
}