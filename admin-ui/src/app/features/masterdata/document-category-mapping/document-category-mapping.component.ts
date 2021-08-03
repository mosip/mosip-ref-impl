import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { AppConfigService } from 'src/app/app-config.service';
import { DocumentCategoryMappingService } from 'src/app/core/services/document-category-mapping.service';
import { AuditService } from 'src/app/core/services/audit.service';
import * as appConstants from '../../../app.constants';
import { Router } from '@angular/router';
import { HeaderService } from "src/app/core/services/header.service";

@Component({
  selector: 'app-document-category-mapping',
  templateUrl: './document-category-mapping.component.html',
  styleUrls: ['./document-category-mapping.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocumentCategoryMappingComponent implements OnInit {

  primaryLang: any;
  allDocCategoryList = new Array<any>();
  selectedItem: any;
  mappedDocList: any[];
  unMappedDoc: any[];
  unMappedDocList: any[];
  mapping: any;
  mappedDocCount: number;
  unMappedDocCount: number;
  showSpinner = false;

  constructor(private translateService: TranslateService,
              private appConfigService: AppConfigService,
              private docCategoryMapping: DocumentCategoryMappingService,
              private router: Router,
              private auditService: AuditService, 
              private headerService: HeaderService) {
    this.primaryLang = this.headerService.getUserPreferredLanguage();
    translateService.use(this.primaryLang);
  }

  ngOnInit() {
    this.mapping = appConstants.masterdataMapping['documentCategoryMapping'];
    this.auditService.audit(3, 'ADM-044', 'Document Category Type Mapping');
    this.getDocCategory();
    this.getUnMappedDoc();
  }

  getDocCategory() {
    this.showSpinner = true;
    this.docCategoryMapping.getAllDocumentCotegory().subscribe(data => {
      if (data && data.response && data.response.documentcategories) {
        data.response.documentcategories.filter((value: any) => {
          if (value.langCode === this.primaryLang) {
            this.allDocCategoryList.push(value);
            this.selectedItem = this.allDocCategoryList[0].code;
          }
        });
        this.docCategoryMapping.setMappedDoc(this.allDocCategoryList[0]);
        this.docCategoryMapping.currentMappedDocList.subscribe(response => {
          this.docCategoryMapping.getMappedDoc(response.code, response.langCode).subscribe(async mappedDoc => {
            if (mappedDoc && mappedDoc.response) {
              await this.getUnMappedDoc();
              this.subtractingMappedDocFromUnMappedDoc(mappedDoc.response, this.unMappedDoc);
              this.showSpinner = false;
            } else {
              this.mappedDocList = [];
              this.unMappedDoc = [];
            }
          });
        });
      }
    });
  }

  subtractingMappedDocFromUnMappedDoc(mappedDoc: any, unMappedDoc: any) {
    let newMappedDoc = mappedDoc.map(function (obj) {
      return {
          code: obj.docTypeCode,
          docCategoryCode: obj.docCategoryCode,
          name: obj.docTypeName,
          langCode: obj.langCode,
          isActive: obj.isActive
      };
    });
    if(newMappedDoc.length > 0){
      for (const mapKey of newMappedDoc) {
        const mapDoc = mapKey;
        if (unMappedDoc) {
          const unMapDoc = unMappedDoc.map((doc: any) => {
            return doc.name;
          }).indexOf(mapDoc.name);
          if(unMapDoc >= 0) {
            unMappedDoc.splice(unMapDoc, 1);
            this.unMappedDocList = unMappedDoc;
            this.unMappedDocCount = this.unMappedDocList.length;
          }
        }
      }
    }else{      
      if(unMappedDoc){
        this.unMappedDocList = unMappedDoc;
        this.unMappedDocCount = this.unMappedDocList.length;
      }else{
        this.unMappedDocList = [];
      }
    }    
    this.mappedDocList = newMappedDoc;
    this.mappedDocCount = this.mappedDocList.length;
  }

  getUnMappedDoc() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.docCategoryMapping.getUnMappeddoc().subscribe(unmappedDoc => {
          if (unmappedDoc && unmappedDoc.response && unmappedDoc.response.documenttypes) {
            this.unMappedDoc = unmappedDoc.response.documenttypes;
          }
        });
        resolve(true);
      }, 1000);
    });
  }

  onCategory(item: object) {
    this.showSpinner = true;
    this.selectedItem = item['code'];
    this.docCategoryMapping.setMappedDoc(item);
    this.docCategoryMapping.currentMappedDocList.subscribe(response => {
      this.docCategoryMapping.getMappedDoc(response.code, response.langCode).subscribe(async data => {
        if (data && data.response && data.response.documents) {
          await this.getUnMappedDoc();
          this.subtractingMappedDocFromUnMappedDoc(data.response.documents, this.unMappedDoc);
          this.showSpinner = false;
        }
      });
    });
  }

  onClose(mappedItem: object, index: number) {
    this.docCategoryMapping.updateUnMappeddoc(this.selectedItem, mappedItem['code']).subscribe(async data => {
      //console.log('Data', data);
    });
    if (mappedItem && (index >= 0)) {
      if (this.unMappedDocList.indexOf(mappedItem['name']) === -1) {
        this.unMappedDocList.push(mappedItem);
        this.mappedDocList.splice(index, 1);
        this.mappedDocCount = this.mappedDocList.length;
        this.unMappedDocCount = this.unMappedDocList.length;
      }
    }
  }

  onAdd(unMappedItem: object, index: number) {
      this.docCategoryMapping.updateMappedDoc(this.selectedItem, unMappedItem['code']).subscribe(async data => {
        //console.log('Data', data);
      });
    if (unMappedItem && (index >= 0) ) {
      if (this.mappedDocList.indexOf(unMappedItem['name']) === -1) {
        this.mappedDocList.push(unMappedItem);
        this.mappedDocCount = this.mappedDocList.length;
        this.unMappedDocList.splice(index, 1);
        this.unMappedDocCount = this.unMappedDocList.length;
      }
    }
  }

  submit() {
    console.log("this.mappedDocCount>>>"+this.mappedDocCount);
    console.log("this.mappedDocList>>>"+this.mappedDocList);
  }

  changePage(location: string) {
    if (location === 'home') {
      this.router.navigateByUrl('admin/masterdata/home');
    } else if (location === 'list') {
      this.router.navigateByUrl(
        'admin/masterdata/documentCategoryMapping'
      );
    }
  }
}
