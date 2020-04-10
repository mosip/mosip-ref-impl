import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as appConstants from '../../app.constants';
import { RequestModel } from '../models/request.model';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable()
export class DataStorageMachineService {
  constructor(private http: HttpClient, private appService: AppConfigService) {}

  private BASE_URL = this.appService.getConfig().baseUrl;

  getMachineSpecificLabelsAndActions(): Observable<any> {
    return this.http.get('./assets/entity-spec/machines.json');
  }

  getImmediateChildren(
    locationCode: string,
    langCode: string
  ): Observable<any> {
    return this.http.get(
      this.BASE_URL +
        appConstants.MASTERDATA_BASE_URL +
        'locations/immediatechildren/' +
        locationCode +
        '/' +
        langCode
    );
  }

  
  createMachine(data: RequestModel): Observable<any> {
    return this.http.post(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + 'machines',
      data
    );
  }
}
