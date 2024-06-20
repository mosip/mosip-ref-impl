import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { AppConfigService } from 'src/app/app-config.service';
import { DocumentCategoryMappingService } from 'src/app/core/services/document-category-mapping.service';
import { AuditService } from 'src/app/core/services/audit.service';

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

  mappedDocCount: number;
  unMappedDocCount: number;
  showSpinner = false;

  constructor(private translateService: TranslateService,
              private appConfigService: AppConfigService,
              private docCategoryMapping: DocumentCategoryMappingService,
              private auditService: AuditService) {
    this.primaryLang = appConfigService.getConfig()['primaryLangCode'];
    translateService.use(this.primaryLang);
  }

  ngOnInit() {
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
            console.log('selected Item', this.selectedItem);
          }
        });
        this.docCategoryMapping.setMappedDoc(this.allDocCategoryList[0]);
        this.docCategoryMapping.currentMappedDocList.subscribe(response => {
          console.log('response', response);
          this.docCategoryMapping.getMappedDoc(response.code, response.langCode).subscribe(async mappedDoc => {
            if (mappedDoc && mappedDoc.response && mappedDoc.response.documents) {
              await this.getUnMappedDoc();
              this.subtractingMappedDocFromUnMappedDoc(mappedDoc.response.documents, this.unMappedDoc);
              this.showSpinner = false;
              console.log('List', this.mappedDocList);
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
    for (const mapKey of mappedDoc) {
      const mapDoc = mapKey;

      if (unMappedDoc) {
        const unMapDoc = unMappedDoc.map((doc: any) => {
          return doc.name;
        }).indexOf(mapDoc.name);
        if (unMapDoc >= 0) {
          unMappedDoc.splice(unMapDoc, 1);
          this.unMappedDocList = unMappedDoc;
          this.unMappedDocCount = this.unMappedDocList.length;
        }
      }
    }
    this.mappedDocList = mappedDoc;
    this.mappedDocCount = this.mappedDocList.length;
  }

  getUnMappedDoc() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.docCategoryMapping.getUnMappeddoc().subscribe(unmappedDoc => {
          console.log('Un MappedDoc', unmappedDoc.response);
          if (unmappedDoc && unmappedDoc.response && unmappedDoc.response.documenttypes) {
            this.unMappedDoc = unmappedDoc.response.documenttypes;
          }
        });
        resolve(true);
      }, 1000);
    });
  }

  onCategory(item: object) {
    console.log('sfdsfsd', item);
    this.showSpinner = true;
    this.selectedItem = item['code'];
    this.docCategoryMapping.setMappedDoc(item);
    this.docCategoryMapping.currentMappedDocList.subscribe(response => {
      this.docCategoryMapping.getMappedDoc(response.code, response.langCode).subscribe(async data => {
        console.log('Data', data);
        if (data && data.response && data.response.documents) {
          await this.getUnMappedDoc();
          this.subtractingMappedDocFromUnMappedDoc(data.response.documents, this.unMappedDoc);
          this.showSpinner = false;
        }
      });
    });
  }

  onClose(mappedItem: object, index: number) {
    console.log('hgdsfsdfds', mappedItem, index);
    if (mappedItem && (index >= 0)) {
      if (this.unMappedDocList.indexOf(mappedItem['name']) === -1) {
        this.unMappedDocList.push(mappedItem);
        this.mappedDocList.splice(index, 1);
        this.mappedDocCount = this.mappedDocList.length;
        console.log('unMapped item', this.unMappedDocList);
        this.unMappedDocCount = this.unMappedDocList.length;
      }
    }
  }

  onAdd(unMappedItem: object, index: number) {
    if (unMappedItem && (index >= 0) ) {
      if (this.mappedDocList.indexOf(unMappedItem['name']) === -1) {
        this.mappedDocList.push(unMappedItem);
        this.mappedDocCount = this.mappedDocList.length;
        this.unMappedDocList.splice(index, 1);
        this.unMappedDocCount = this.unMappedDocList.length;
      }
    }
  }
}
