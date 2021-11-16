import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { AppConfigService } from 'src/app/app-config.service';
import { AuditService } from 'src/app/core/services/audit.service';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-master-data',
  templateUrl: './master-data.component.html',
  styleUrls: ['./master-data.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MasterDataComponent implements OnInit {

  primaryLang: string;

  masterDataCommonList: any[];
  masterDataDeviceList: any[];
  masterDataMachineList: any[];
  masterDataDocumentList: any[];
  dynamicfieldDistinctValue: any[];
  arrowDirection = 'keyboard_arrow_right'; 

  constructor(private dataService: DataStorageService,
              private router: Router,
              private headerService: HeaderService,
              private appConfigService: AppConfigService,
              private translateService: TranslateService,
              private auditService: AuditService) {
    this.primaryLang = this.headerService.getUserPreferredLanguage();
    translateService.use(this.primaryLang);
  }

  ngOnInit() {
    this.auditService.audit(4, 'ADM-043');
    if(this.primaryLang === "ara"){
      this.arrowDirection = 'keyboard_arrow_left';
    }
    this.dataService.getMasterDataTypesList().subscribe(data => {
      console.log('Master Data', data);
      this.masterDataCommonList = data.masterDatatList.common;
      this.masterDataDeviceList = data.masterDatatList.deviceDefinition;
      this.masterDataMachineList = data.masterDatatList.machineDefinition;
      this.masterDataDocumentList = data.masterDatatList.documentDefinition;
    });
    this.dataService.getDynamicfieldDistinctValue(this.primaryLang).subscribe(
      response => {
      if (response.response) {
        this.dynamicfieldDistinctValue = response.response;
      }
    });
  }

  onList(item: any) {
    this.auditService.audit(2, item.auditEventId, item.label[this.primaryLang]);
    console.log('Single Item', item.actionURL);
    this.router.navigateByUrl(item.actionURL);
  }

  dynamicFeildNavigate(item: any) {
    this.router.navigateByUrl('admin/masterdata/dynamicfields/'+item.name+'/view');
  }

  dynamicFeildAdd() {
    this.router.navigateByUrl('admin/masterdata/dynamicfields/new/create');
  }

}
