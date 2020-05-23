import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { AppConfigService } from 'src/app/app-config.service';
import { AuditService } from 'src/app/core/services/audit.service';


@Component({
  selector: 'app-master-data',
  templateUrl: './master-data.component.html',
  styleUrls: ['./master-data.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MasterDataComponent implements OnInit {

  primaryLang: string;
  secondaryLang: string;

  masterDataCommonList: any[];
  masterDataDeviceList: any[];
  masterDataMachineList: any[];
  masterDataDocumentList: any[];

  constructor(private dataService: DataStorageService,
              private router: Router,
              private appConfigService: AppConfigService,
              private translateService: TranslateService,
              private auditService: AuditService) {
    // tslint:disable-next-line:no-string-literal
    this.primaryLang = appConfigService.getConfig()['primaryLangCode'];
    // tslint:disable-next-line:no-string-literal
    this.secondaryLang = appConfigService.getConfig()['secondaryLangCode'];
    translateService.use(this.primaryLang);
  }

  ngOnInit() {
    this.auditService.audit(4, 'ADM-043');
    this.dataService.getMasterDataTypesList().subscribe(data => {
      console.log('Master Data', data);
      this.masterDataCommonList = data.masterDatatList.common;
      this.masterDataDeviceList = data.masterDatatList.deviceDefinition;
      this.masterDataMachineList = data.masterDatatList.machineDefinition;
      this.masterDataDocumentList = data.masterDatatList.documentDefinition;
    });
  }

  onList(item: any) {
    this.auditService.audit(2, item.auditEventId, item.label[this.primaryLang]);
    console.log('Single Item', item.actionURL);
    this.router.navigateByUrl(item.actionURL);
  }

}
