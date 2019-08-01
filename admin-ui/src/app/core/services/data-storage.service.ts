import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as appConstants from '../../app.constants';
import { RequestModel } from '../models/request.model';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable()
export class DataStorageService {

  constructor(private http: HttpClient, private appService: AppConfigService) {}

  private BASE_URL = this.appService.getConfig().baseUrl;

  getCenterSpecificLabelsAndActions(): Observable<any> {
    return this.http.get('./assets/entity-spec/center.json');
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

  getStubbedDataForDropdowns(): Observable<any> {
    return this.http.get('./assets/data/centers-stub-data.json');
  }

  createCenter(data: RequestModel): Observable<any> {
    return this.http.post(
      this.BASE_URL +
      appConstants.MASTERDATA_BASE_URL + 'registrationcenters',
      data
    );
  }

  updateCenter(data: RequestModel): Observable<any> {
    return this.http.put(
      this.BASE_URL +
      appConstants.MASTERDATA_BASE_URL + 'registrationcenters',
      data
    );
  }

  getDevicesData(request: RequestModel): Observable<any> {
    return this.http.post(this.BASE_URL + appConstants.URL.devices, request);
  }

  getMachinesData(request: RequestModel): Observable<any> {
    console.log(request);
    return this.http.post(this.BASE_URL + appConstants.URL.machines, request);
  }

  getMasterDataTypesList(): Observable<any> {
    return this.http.get('./assets/entity-spec/master-data-entity-spec.json');
  }

  getMasterDataByTypeAndId(type: string, data: RequestModel): Observable<any> {
    return this.http.post(
      this.BASE_URL +
      appConstants.MASTERDATA_BASE_URL + type + '/search',
      data
    );
  }

  getSpecFileForMasterDataEntity(filename: string): Observable<any> {
    return this.http.get(`./assets/entity-spec/${filename}.json`);
  }

  getFiltersForListView(filename: string): Observable<any> {
    return this.http.get(`./assets/entity-spec/${filename}.json`);
  }

  getFiltersForAllMaterDataTypes(type: string, data: RequestModel): Observable<any> {
    return this.http.post(
      this.BASE_URL +
      appConstants.MASTERDATA_BASE_URL + type + '/filtervalues',
      data
    );
  }
  getZoneData(langCode: string): Observable<any> {
    return this.http.get(this.BASE_URL + appConstants.MASTERDATA_BASE_URL + 'zones/leafs/' + langCode);
  }
}
