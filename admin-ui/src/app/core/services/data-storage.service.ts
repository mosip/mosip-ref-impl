import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as appConstants from '../../app.constants';
import { RequestModel } from '../models/request.model';
import { AppConfigService } from 'src/app/app-config.service';
import { Router } from '@angular/router';

@Injectable()
export class DataStorageService {
  constructor(private http: HttpClient, private appService: AppConfigService, private router: Router) {}

  private BASE_URL = this.appService.getConfig().baseUrl;
  
  getI18NLanguageFiles(langCode:string){
   return this.http.get(`./assets/i18n/${langCode}.json`);
  }

  getCenterSpecificLabelsAndActions(): Observable<any> {
    return this.http.get('./assets/entity-spec/center.json');
  }

  getDeviceSpecificLabelsAndActions(): Observable<any> {
    return this.http.get('./assets/entity-spec/devices.json');
  }

  getMasterDataSpecificLabelsAndActions(fileName:string): Observable<any> {
    return this.http.get('./assets/entity-spec/'+fileName+'.json');
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

  getStubbedDataForDropdowns(langCode: string): Observable<any> {
    return this.http.get(this.BASE_URL + appConstants.MASTERDATA_BASE_URL + 'locations/level/' + langCode);
  }

  getLocationHierarchyLevels(langCode: string): Observable<any> {
    return this.http.get(this.BASE_URL + appConstants.MASTERDATA_BASE_URL + 'locationHierarchyLevels/' + langCode);
  }

  createCenter(data: RequestModel): Observable<any> {
    return this.http.post(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + 'registrationcenters',
      data
    );
  }

  createMachine(data: RequestModel): Observable<any> {
    return this.http.post(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + 'machines',
      data
    );
  }

  createDevice(data: RequestModel): Observable<any> {
    return this.http.post(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + 'devices',
      data
    );
  }

  createMasterData(data: RequestModel): Observable<any> {
    let url = this.router.url.split('/')[3];

    let urlmapping = {"centers":"registrationcenters", "machines":"machines", "devices":"devices", "center-type":"registrationcentertypes", "blacklisted-words":"blacklistedwords", "gender-type":"gendertypes", "individual-type":"individualtypes", "holiday":"holidays", "location":"locations", "templates":"templates", "title":"title", "device-specs":"devicespecifications", "device-types":"devicetypes", "machine-specs":"machinespecifications", "machine-type":"machinetypes", "document-type":"documenttypes", "document-categories":"documentcategories"};

    return this.http.post(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + urlmapping[url],
      data
    );
  }

  updateData(data: RequestModel): Observable<any> {
    let url = this.router.url.split('/')[3];

    let urlmapping = {"centers":"registrationcenters", "machines":"machines", "devices":"devices", "center-type":"registrationcentertypes", "blacklisted-words":"blacklistedwords", "gender-type":"gendertypes", "individual-type":"individualtypes", "holiday":"holidays", "location":"locations", "templates":"templates", "title":"title", "device-specs":"devicespecifications", "device-types":"devicetypes", "machine-specs":"machinespecifications", "machine-type":"machinetypes", "document-type":"documenttypes", "document-categories":"documentcategories"};

    return this.http.put(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + urlmapping[url],
      data
    );
  }

  updateDataStatus(data: RequestModel): Observable<any> {
    let url = this.router.url.split('/')[3];
    let urlmapping = {"centers":"registrationcenters", "machines":"machines", "devices":"devices", "center-type":"registrationcentertypes", "blacklisted-words":"blacklistedwords", "gender-type":"gendertypes", "individual-type":"individualtypes", "holiday":"holidays", "location":"locations", "templates":"templates", "title":"title", "device-specs":"devicespecifications", "device-types":"devicetypes", "machine-specs":"machinespecifications", "machine-type":"machinetypes", "document-type":"documenttypes", "document-categories":"documentcategories"};

    return this.http.patch(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + urlmapping[url]+'?isActive='+data.request.isActive+"&"+Object.keys(data["request"])[0]+"="+data["request"][Object.keys(data["request"])[0]],
      data
    );
  }

  updateCenterLangData(data: RequestModel): Observable<any> {
    return this.http.put(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + "registrationcenters/language",
      data
    );
  }

  updateCenterNonLangData(data: RequestModel): Observable<any> {
    return this.http.put(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + "registrationcenters/nonlanguage",
      data
    );
  }

  getDevicesData(request: RequestModel): Observable<any> {
    return this.http.post(this.BASE_URL + appConstants.URL.devices, request);
  }

  getMachinesData(request: RequestModel): Observable<any> {
    return this.http.post(this.BASE_URL + appConstants.URL.machines, request);
  }

  getMasterDataTypesList(): Observable<any> {
    return this.http.get('./assets/entity-spec/master-data-entity-spec.json');
  }

  getMasterDataByTypeAndId(type: string, data: RequestModel): Observable<any> {
    return this.http.post(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + type + '/search?addMissingData=true',
      data
    );
  }

  getSpecFileForMasterDataEntity(filename: string): Observable<any> {
    return this.http.get(`./assets/entity-spec/${filename}.json`);
  }

  getFiltersForListView(filename: string): Observable<any> {
    return this.http.get(`./assets/entity-spec/${filename}.json`);
  }

  getFiltersForAllMaterDataTypes(
    type: string,
    data: RequestModel
  ): Observable<any> {
    return this.http.post(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + type + '/filtervalues',
      data
    );
  }

  getDropDownValuesForMasterData(
    type: string
  ): Observable<any> {
    return this.http.get(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + type
    );
  }

  getZoneData(langCode: string): Observable<any> {
    return this.http.get(
      this.BASE_URL +
        appConstants.MASTERDATA_BASE_URL +
        'zones/leafs/' +
        langCode
    );
  }

  getLoggedInUserZone(userId: string, langCode: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('userID', userId);
    params = params.append('langCode', langCode);
    return this.http.get(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + 'zones/zonename',
      { params }
    );
  }

  decommission(centerId: string) {
    let url = this.router.url.split('/')[3];
    if (url === 'centers') {
      url = 'registrationcenters';
    }
    return this.http.put(
      this.BASE_URL +
        appConstants.MASTERDATA_BASE_URL +
        url + '/' +
        'decommission/' +
        centerId,
      {}
    );
  }

  getPacketStatus(registrationId: string) {
    const params = new HttpParams().set('rid', registrationId);
    return this.http.get(this.BASE_URL + 'admin/packetstatusupdate', {params});
  }

  getCreateUpdateSteps(entity: string) {
  return this.http.get(`./assets/create-update-steps/${entity}-steps.json`);
  }

  getMissingData(langCode: string, fieldName: string): Observable<any> {
    let url = this.router.url.split('/')[3];
    let urlmapping = {"centers":"registrationcenters", "machines":"machines", "devices":"devices", "center-type":"registrationcentertypes", "blacklisted-words":"blacklistedwords", "gender-type":"gendertypes", "individual-type":"individualtypes", "holiday":"holidays", "location":"locations", "templates":"templates", "title":"title", "device-specs":"devicespecifications", "device-types":"devicetypes", "machine-specs":"machinespecifications", "machine-type":"machinetypes", "document-type":"documenttypes", "document-categories":"documentcategories"};
    return this.http.get(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + urlmapping[url] + `/missingids/${langCode}?fieldName=${fieldName}`
    );
  }
}
