import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestModel } from '../models/request.model';
import { URL } from 'src/app/app.constants';
import { Observable } from 'rxjs';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class CenterService {

  constructor(private http: HttpClient) { }

  getRegistrationCentersDetails(request: RequestModel): Observable<any> {
    console.log(JSON.stringify(request));
    return this.http.post(URL.centers, request, httpOptions);
  }
}
