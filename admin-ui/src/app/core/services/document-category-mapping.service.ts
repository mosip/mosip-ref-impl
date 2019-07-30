import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppConfigService } from 'src/app/app-config.service';
import { URL } from 'src/app/app.constants';



@Injectable({
  providedIn: 'root'
})
export class DocumentCategoryMappingService {

  primaryLang: any;

  constructor(private http: HttpClient, private appConfigService: AppConfigService) {
    this.primaryLang = appConfigService.getConfig()['primaryLangCode'];
  }

  currentMappedDocList = new BehaviorSubject(null);

  getAllDocumentCotegory(): Observable<any> {
    return this.http.get(URL.documentCategories).pipe(map(response => {
      return response;
    }));
  }

  getMappedDoc(code: string, lang: string): Observable<any> {
    return this.http.get(URL.mappedDocUrl + code + '/' + lang).pipe(map(response => {
      return response;
    }));
  }

  getUnMappeddoc(): Observable<any> {
    return this.http.get(URL.unMappedDocUrl + this.primaryLang).pipe(map(response => {
      return response;
    }));
  }

  setMappedDoc(item: any) {
    console.log('Next Item', item);
    this.currentMappedDocList.next(item);
  }
}
