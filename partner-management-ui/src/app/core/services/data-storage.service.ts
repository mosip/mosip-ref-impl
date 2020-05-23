import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getMispSpecificLabelsAndActions(): Observable<any> {
    return this.http.get('./assets/entity-spec/misp.json');
  }

  getPolicySpecificLabelsAndActions(): Observable<any> {
    return this.http.get('./assets/entity-spec/policy.json');
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

  updatePartner(data: RequestModel, pid: string): Observable<any> {
    return this.http.put(
      "/partners" + "/" + pid,
      data
    );
  }

  getPartnerManagerData(request: RequestModel): Observable<any> {
    return this.http.get("/pmpartners/getManager");
  }

  public submitRequest(data: RequestModel, pid: string) : Observable<any>{
    return this.http.post(
      "/partners/submit" + "/" + pid + "/partnerAPIKeyRequests",
      data
    );
  }
  
  public submitAuthPolicyReq(data: RequestModel, pid: string) : Observable<any>{
    return this.http.post(
      "/policies" + "/" + pid + "/authPolicies",
      data
    );
  }

  public activatePartnerStatus(data: RequestModel, pid: string) : Observable<any>{
    return this.http.put(
      "/pmpartners/updateStatus" + "/" + pid,
      data
    );
  }

  public approvePartnerRequest(data: RequestModel, reqid: string) : Observable<any>{
    return this.http.put(
      "/pmpartners/PartnerAPIKeyRequests" + "/" + reqid,
      data
    );
  }

  public deactivateAPIKey(data: RequestModel, pid: string , apikey: string) : Observable<any>{
    console.log("Request is: "+ data);
    return this.http.put(
      "/pmpartners" + "/" + pid + "/" + apikey,
      data
    );
  }

  getStubbedDataForDropdowns(): Observable<any> {
    return this.http.get('./assets/data/centers-stub-data.json');
  }


  createPartner(data: RequestModel): Observable<any> {
    return this.http.post("/partnerReg", data);
  }

  getPolicyID(PolicyName:string): Observable<any> {
    return this.http.get("/pmpartners/policyname" + "/" + PolicyName);
  }


  updatePaPolicy(request: RequestModel , partnerID:string , partnerAPIKey:string): Observable<any> {
    return this.http.post(
      "/pmpartners" + "/" + partnerID + "/" + partnerAPIKey , request
    );
  }

  createCenter(data: RequestModel): Observable<any> {
    return this.http.post(
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + 'registrationcenters',
      data
    );
  }

  data = [];
    popupMessages: any;

  createMisp(data: RequestModel): Observable<any> {    
    return this.http.post(
      "/misps",data
    );
  }
  createPolicy(data: RequestModel): Observable<any> {
    
    return this.http.post(
      "/policies",data
    );
    console.log(this.popupMessages);
  }

  updateMisp(data: RequestModel): Observable<any> {
    return this.http.put("/misps/" +data.request.id ,data
    );
  }

  updatePolicyStatus(data: RequestModel): Observable<any> {
    return this.http.put("/policies/" +data.request.id ,data
    );
  }

  updatePolicy(data: RequestModel): Observable<any> {
    return this.http.post("/policies/" +data.request.id ,data
    );
  }

  approveMisp(data: RequestModel): Observable<any> {
    return this.http.post("/misps/" + data.request.id +
    '/status',data
    );
  }

  updateCenter(data: RequestModel): Observable<any> {
    return this.http.post(
      '/misps/'+data.request.id,
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
      this.BASE_URL + appConstants.MASTERDATA_BASE_URL + type + '/search',
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

  decommissionCenter(centerId: string) {
    return this.http.put(
      // this.BASE_URL +
      //   appConstants.MASTERDATA_BASE_URL +
      //   'registrationcenters/' +
        '/misps/' +
        centerId +
        '/status',
      {}
    );
  }
}