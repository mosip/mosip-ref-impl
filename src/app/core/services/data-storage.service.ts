import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class DataStorageService {

  constructor(private http: HttpClient) { }

  getLanguageSpecificLabels(langCode: string): Observable<any> {
    return this.http.get(`./assets/i18n/${langCode}.json`);
  }

}
