import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";

import * as appConstants from "../../app.constants";
import { AppConfigService } from "../../app-config.service";
import { Applicant } from "../../shared/models/dashboard-model/dashboard.modal";
import { ConfigService } from "./config.service";
import { RequestModel } from "src/app/shared/models/request-model/RequestModel";

/**
 * @description This class is responsible for sending or receiving data to the service.
 *
 * @author Shashank Agrawal
 * @export
 * @class DataStorageService
 */
@Injectable({
  providedIn: "root",
})
export class DataStorageService {
  /**
   * @description Creates an instance of DataStorageService.
   * @see HttpClient
   * @param {HttpClient} httpClient
   * @param {AppConfigService} appConfigService
   * @param {ConfigService} configService
   * @memberof DataStorageService
   */
  constructor(
    private httpClient: HttpClient,
    private appConfigService: AppConfigService,
    private configService: ConfigService
  ) {}

  BASE_URL = this.appConfigService.getConfig()["BASE_URL"];
  PRE_REG_URL = this.appConfigService.getConfig()["PRE_REG_URL"];

  getUsers(userId: string) {
    let url =
      this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.applicants;
    return this.httpClient.get<Applicant[]>(url);
  }

  /**
   * @description This method returns the user details for the given pre-registration id.
   *
   * @param {string} preRegId - pre-registartion-id
   * @returns an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  getUser(preRegId: string) {
    let url =
      this.BASE_URL +
      this.PRE_REG_URL +
      appConstants.APPEND_URL.applicants +
      appConstants.APPENDER +
      preRegId;
    return this.httpClient.get(url);
  }

  /**
   * @description This methos returns the list of available genders
   *
   *
   * @returns an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  getGenderDetails() {
    const url = this.BASE_URL + this.PRE_REG_URL + '/proxy' + appConstants.APPEND_URL.gender;
    return this.httpClient.get(url);
  }

  /**
   * @description This methos returns the list of available genders
   *
   *
   * @returns an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  getResidentDetails() {
    const url = this.BASE_URL + this.PRE_REG_URL + '/proxy' + appConstants.APPEND_URL.resident;
    return this.httpClient.get(url);
  }

  /**
   * @description This method is responsible for doing the transliteration for a given word.
   *
   * @param {*} request
   * @returns an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  getTransliteration(request: any) {
    const obj = new RequestModel(appConstants.IDS.transliteration, request);
    const url =
      this.BASE_URL +
      this.PRE_REG_URL +
      appConstants.APPEND_URL.transliteration;
    return this.httpClient.post(url, obj);
  }

  getUserDocuments(preRegId) {
    return this.httpClient.get(
      this.BASE_URL +
        this.PRE_REG_URL +
        appConstants.APPEND_URL.document +
        preRegId
    );
  }

  /**
   * @description This method adds the user
   *
   * @param {*} identity `Object`
   * @returns an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  addUser(identity: any) {
    const obj = new RequestModel(appConstants.IDS.newUser, identity);
    let url =
      this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.applicants;
    return this.httpClient.post(url, obj);
  }

  updateUser(identity: any, preRegId: string) {
    let url =
      this.BASE_URL +
      this.PRE_REG_URL +
      appConstants.APPEND_URL.applicants +
      appConstants.APPENDER +
      preRegId;
    const obj = new RequestModel(appConstants.IDS.updateUser, identity);
    return this.httpClient.put(url, obj);
  }

  sendFile(formdata: FormData, preRegId: string) {
    return this.httpClient.post(
      this.BASE_URL +
        this.PRE_REG_URL +
        appConstants.APPEND_URL.post_document +
        preRegId,
      formdata
    );
  }

  deleteRegistration(preId: string) {
    return this.httpClient.delete(
      this.BASE_URL +
        this.PRE_REG_URL +
        appConstants.APPEND_URL.delete_application +
        preId
    );
  }

  cancelAppointment(data: RequestModel, preRegId: string) {
    return this.httpClient.put(
      this.BASE_URL +
        this.PRE_REG_URL +
        appConstants.APPEND_URL.cancelAppointment +
        preRegId,
      data
    );
  }

  getNearbyRegistrationCenters(coords: any) {
    return this.httpClient.get(
      this.BASE_URL +
        this.PRE_REG_URL + '/proxy' +
        appConstants.APPEND_URL.master_data +
        appConstants.APPEND_URL.nearby_registration_centers +
        localStorage.getItem("langCode") +
        "/" +
        coords.longitude +
        "/" +
        coords.latitude +
        "/" +
        this.configService.getConfigByKey(
          appConstants.CONFIG_KEYS.preregistration_nearby_centers
        )
    );
  }

  getRegistrationCentersByName(locType: string, text: string) {
    return this.httpClient.get(
      this.BASE_URL +
        this.PRE_REG_URL + '/proxy' +
        appConstants.APPEND_URL.master_data +
        appConstants.APPEND_URL.registration_centers_by_name +
        localStorage.getItem("langCode") +
        "/" +
        locType +
        "/" +
        text
    );
  }

  getLocationTypeData() {
    return this.httpClient.get(
      this.BASE_URL +  this.PRE_REG_URL + '/proxy' +
        appConstants.APPEND_URL.master_data +
        "locations/" +
        localStorage.getItem("langCode")
    );
  }

  getLocationsHierarchyByLangCode(langCode: string, locCode: string) {
    return this.httpClient.get(
      this.BASE_URL + this.PRE_REG_URL + '/proxy' +
        appConstants.APPEND_URL.master_data +
        "locations/" +
        locCode +
        "/" +
        langCode
    );
  }

  getAvailabilityData(registrationCenterId) {
    return this.httpClient.get(
      this.BASE_URL +
        this.PRE_REG_URL +
        appConstants.APPEND_URL.booking_availability +
        registrationCenterId
    );
  }

  makeBooking(request: RequestModel) {
    return this.httpClient.post(
      this.BASE_URL +
        this.PRE_REG_URL +
        appConstants.APPEND_URL.booking_appointment,
      request
    );
  }

  /**
   * @description This method return the list of list of countries.
   *
   * @return String
   * @memberof DataStorageService
   */
  getLocationMetadataHirearchy() {
    return this.configService.getConfigByKey(
      appConstants.CONFIG_KEYS.mosip_country_code
    );
  }

  /**
   * @description This method return the below list of location hierarchy in specified language for the given location hierarchy and langugae code.
   *
   * @param {string} lang
   * @param {string} location
   * @return an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  getLocationImmediateHierearchy(lang: string, location: string) {
    const url =
      this.BASE_URL  + this.PRE_REG_URL + '/proxy' +
      appConstants.APPEND_URL.master_data +
      appConstants.APPEND_URL.location_immediate_children +
      location +
      appConstants.APPENDER +
      lang;
    return this.httpClient.get(url);
  }

  deleteFile(documentId, preRegId) {
    return this.httpClient.delete(
      this.BASE_URL +
        this.PRE_REG_URL +
        appConstants.APPEND_URL.post_document +
        documentId,
      {
        params: new HttpParams().append(
          appConstants.PARAMS_KEYS.preRegistrationId,
          preRegId
        ),
      }
    );
  }

  getSecondaryLanguageLabels(langCode: string) {
    return this.httpClient.get(`./assets/i18n/${langCode}.json`);
  }

  copyDocument(sourceId: string, destinationId: string) {
    const url =
      this.BASE_URL +
      this.PRE_REG_URL +
      appConstants.APPEND_URL.post_document +
      destinationId +
      "?catCode=" +
      appConstants.PARAMS_KEYS.POA +
      "&sourcePreId=" +
      sourceId;
    // const params = new URLSearchParams().set(appConstants.PARAMS_KEYS.catCode, appConstants.PARAMS_KEYS.POA);
    // params.set(appConstants.PARAMS_KEYS.sourcePrId, sourceId);

    return this.httpClient.put(url, {
      observe: "body",
      responseType: "json",
    });
  }

  getFileData(fileDocumentId, preId) {
    return this.httpClient.get(
      this.BASE_URL +
        this.PRE_REG_URL +
        appConstants.APPEND_URL.post_document +
        fileDocumentId,
      {
        params: new HttpParams().append(
          appConstants.PARAMS_KEYS.preRegistrationId,
          preId
        ),
      }
    );
  }

  generateQRCode(data: string) {
    const obj = new RequestModel(appConstants.IDS.qrCode, data);
    return this.httpClient.post(
      this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.qr_code,
      obj
    );
  }

  sendNotification(data: FormData) {
    return this.httpClient.post(
      this.BASE_URL +
        this.PRE_REG_URL +
        appConstants.APPEND_URL.notification +
        appConstants.APPEND_URL.send_notification,
      data
    );
  }

  getLocationOnLocationCodeAndLangCode(locationCode, langCode) {
    const url =
      this.BASE_URL + this.PRE_REG_URL + '/proxy' +
      appConstants.APPEND_URL.master_data +
      "locations/" +
      locationCode +
      "/" +
      langCode;
    return this.httpClient.get(url);
  }

  recommendedCenters(
    langCode: string,
    locationHierarchyCode: number,
    data: string[]
  ) {
    console.log(data);
    let url =
      this.BASE_URL + this.PRE_REG_URL + '/proxy' +
      appConstants.APPEND_URL.master_data +
      "registrationcenters/" +
      langCode +
      "/" +
      locationHierarchyCode +
      "/names?";
    data.forEach((name) => {
      url += "name=" + name;
      if (data.indexOf(name) !== data.length - 1) {
        url += "&";
      }
    });
    if (url.charAt(url.length - 1) === "&") {
      url = url.substring(0, url.length - 1);
    }
    return this.httpClient.get(url);
  }

  getRegistrationCenterByIdAndLangCode(id: string, langCode: string) {
    const url =
      this.BASE_URL + this.PRE_REG_URL + '/proxy' +
      appConstants.APPEND_URL.master_data +
      "registrationcenters/" +
      id +
      "/" +
      langCode;
    return this.httpClient.get(url);
  }

  getGuidelineTemplate(templateType: string) {
    const url =
      this.BASE_URL + this.PRE_REG_URL + '/proxy' +
      appConstants.APPEND_URL.master_data +
      "templates/" +
      localStorage.getItem("langCode") +
      "/" +
      templateType;
    return this.httpClient.get(url);
  }

  getApplicantType(docuemntCategoryDto) {
    return this.httpClient.post(
      this.BASE_URL + this.PRE_REG_URL + '/proxy' +
        appConstants.APPEND_URL.applicantType +
        appConstants.APPEND_URL.getApplicantType,
      docuemntCategoryDto
    );
  }

  getDocumentCategories(applicantCode) {
    const APPLICANT_VALID_DOCUMENTS_URL =
      this.BASE_URL + this.PRE_REG_URL + '/proxy' +
      appConstants.APPEND_URL.location +
      appConstants.APPEND_URL.validDocument +
      applicantCode +
      "/languages";
    return this.httpClient.get(APPLICANT_VALID_DOCUMENTS_URL, {
      params: new HttpParams().append(
        appConstants.PARAMS_KEYS.getDocumentCategories,
        localStorage.getItem("langCode")
      ),
    });
  }

  getConfig() {
    //    return this.httpClient.get('./assets/configs.json');
    const url =
      this.BASE_URL +
      this.PRE_REG_URL +
      appConstants.APPEND_URL.auth +
      appConstants.APPEND_URL.config;
    return this.httpClient.get(url);
  }

  sendOtp(userId: string,langCode: string) {
    const req = {
      langCode: langCode,
      userId: userId,
    };

    const obj = new RequestModel(appConstants.IDS.sendOtp, req);

    const url =
      this.BASE_URL +
      this.PRE_REG_URL +
      appConstants.APPEND_URL.auth +
      appConstants.APPEND_URL.send_otp + "/" + "langcode";
    return this.httpClient.post(url, obj);
  }

  verifyOtp(userId: string, otp: string) {
    const request = {
      otp: otp,
      userId: userId,
    };

    const obj = new RequestModel(appConstants.IDS.validateOtp, request);

    const url =
      this.BASE_URL +
      this.PRE_REG_URL +
      appConstants.APPEND_URL.auth +
      appConstants.APPEND_URL.login;
    return this.httpClient.post(url, obj);
  }

  /**
   * @description This is to get the list of working days for a given registration center id.
   *
   * @param {string} registartionCenterId
   * @param {string} langCode
   * @returns
   * @memberof DataStorageService
   */
  getWorkingDays(registartionCenterId: string, langCode: string) {
    const url =
      this.BASE_URL + this.PRE_REG_URL + '/proxy' +
      appConstants.APPEND_URL.master_data +
      "workingdays/" +
      registartionCenterId +
      "/" +
      langCode;
    return this.httpClient.get(url);
  }

  /**
   * @description This method is responsible to logout the user and invalidate the token.
   *
   * @returns an `Observable` of the body as an `Object`
   * @memberof DataStorageService
   */
  onLogout() {
    const url =
      this.BASE_URL +
      this.PRE_REG_URL +
      appConstants.APPEND_URL.auth +
      appConstants.APPEND_URL.logout;
    return this.httpClient.post(url, "");
  }

  verifyGCaptcha(captcha) {
    console.log(captcha);
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    const url =
      this.BASE_URL + this.PRE_REG_URL + appConstants.APPEND_URL.captcha;
    return this.httpClient.post(url, captcha);
  }

  getIdentityJson() {
    const url =this.BASE_URL + this.PRE_REG_URL+ 'applications/config';
    //const url = "assets/identity-spec.json";
    return this.httpClient.get(url);
  }

  getRegistrationCentersById(regCenterId, langCode: string) {
    return this.httpClient.get(
      this.BASE_URL + this.PRE_REG_URL + '/proxy' +
        appConstants.APPEND_URL.master_data +
        appConstants.APPEND_URL.registration_centers_by_name +
        regCenterId +
        "/" +
        langCode
    );
  }

  getAppointmentDetails(preRegId) {
    return this.httpClient.get(
      this.BASE_URL +
        this.PRE_REG_URL +
        appConstants.APPEND_URL.booking_appointment +
        "/" +
        preRegId
    );
  }

  getDynamicFieldsandValues(langCode) {
    // const url =this.BASE_URL + this.PRE_REG_URL+ 'applications/config';
    const url =
      this.BASE_URL + this.PRE_REG_URL + '/proxy' +
      appConstants.APPEND_URL.master_data +
      `dynamicfields?langCode=${langCode}`;
    console.log(url);
    return this.httpClient.get(url);
  }

  updateDocRefId(fileDocumentId, preId, docRefId) {
    const url = `${this.BASE_URL}${this.PRE_REG_URL}` +
      `${appConstants.APPEND_URL.updateDocRefId}${fileDocumentId}` +
      `?${appConstants.PARAMS_KEYS.preRegistrationId}=${preId}`+
      `&${appConstants.PARAMS_KEYS.docRefId}=${docRefId}`;
    return this.httpClient.put(url, {});
  }
}
