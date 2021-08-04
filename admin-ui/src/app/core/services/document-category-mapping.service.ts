import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppConfigService } from 'src/app/app-config.service';
import { URL } from 'src/app/app.constants';
import { HeaderService } from "src/app/core/services/header.service";


@Injectable({
  providedIn: 'root'
})
export class DocumentCategoryMappingService {

  primaryLang: any;
  private BASE_URL: string;

  constructor(private http: HttpClient, private appConfigService: AppConfigService, private headerService: HeaderService) {
    this.primaryLang = this.headerService.getUserPreferredLanguage();
    this.BASE_URL = appConfigService.getConfig().baseUrl;
  }

  currentMappedDocList = new BehaviorSubject(null);

  getAllDocumentCotegory(): Observable<any> {
    return this.http.get(this.BASE_URL + URL.documentCategories).pipe(map(response => {
      return response;
    }));
  }

  getMappedDoc(code: string, lang: string): Observable<any> {
    return this.http.get(this.BASE_URL + 'masterdata/validdocuments/' + code +'/'+ lang).pipe(map(response => {
      return response;
    }));
  }

  getUnMappeddoc(): Observable<any> {
    return this.http.get(this.BASE_URL + URL.unMappedDocUrl + this.primaryLang).pipe(map(response => {
      return response;
    }));
  }

  updateMappedDoc(doccategorycode: string, doctypecode: string): Observable<any> {

    return this.http.put(
      this.BASE_URL + 'masterdata/validdocuments/map/' + doccategorycode + '/' + doctypecode,
      ""
    );

  }

  updateUnMappeddoc(doccategorycode: string, doctypecode: string): Observable<any> {
    return this.http.put(
      this.BASE_URL + 'masterdata/validdocuments/unmap/' + doccategorycode + '/' + doctypecode,
      ""
    );
  }

  setMappedDoc(item: any) {
    console.log('Next Item', item);
    this.currentMappedDocList.next(item);
  }
}
