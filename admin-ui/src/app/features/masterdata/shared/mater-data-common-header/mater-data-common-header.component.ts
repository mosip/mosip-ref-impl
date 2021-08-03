import { Component, OnInit, Input } from '@angular/core';
import { HeaderModel } from 'src/app/core/models/header.model';
import { Router } from '@angular/router';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { AppConfigService } from 'src/app/app-config.service';
import { CommonService } from 'src/app/core/services/common.service';
import { CenterModel } from 'src/app/core/models/center.model';
import * as appConstants from '../../../../app.constants';
import { HeaderService } from 'src/app/core/services/header.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-mater-data-common-header',
  templateUrl: './mater-data-common-header.component.html'
})
export class MaterDataCommonHeaderComponent implements OnInit {
  actionButtonElipses = new Array();
  primaryLang: string;
  @Input() masterDataName: string;
  @Input() headerData: HeaderModel;

  constructor(
  	private router: Router,
  	private dataStorageSerice: DataStorageService,
    private appService: AppConfigService,
    private commonService: CommonService, 
    private translateService: TranslateService,
    private headerService: HeaderService
  	) { 
    this.primaryLang = this.headerService.getUserPreferredLanguage();
    translateService.use(this.primaryLang);
  }

  ngOnInit() {
  }

  ngOnChanges(): void {
  	let url = this.router.url.split('/')[3];
  	let mapping = appConstants.masterdataMapping[url];
    this.dataStorageSerice.getMasterDataSpecificLabelsAndActions(mapping.specFileName).subscribe(data => {
      this.actionButtonElipses = data.actionButtons.filter(
        item => item.showIn === 'Ellipsis'
      );
      if (this.headerData.isActive) {
        const object = this.actionButtonElipses.filter(
          item => item.buttonName.eng === 'Activate'
        );
        const index = this.actionButtonElipses.indexOf(object[0]);
        this.actionButtonElipses.splice(index, 1);
      } else {
        const object = this.actionButtonElipses.filter(
          item => item.buttonName.eng === 'Deactivate'
        );
        const index = this.actionButtonElipses.indexOf(object[0]);
        this.actionButtonElipses.splice(index, 1);
      }
      const viewOption = this.actionButtonElipses.filter(
        item => item.buttonName.eng === 'View'
      );
      const viewIndex = this.actionButtonElipses.indexOf(viewOption[0]);
      this.actionButtonElipses.splice(viewIndex, 1);
    });
  }

  selectedRow(id: string, specData: any) {  	
    if (specData.callBackFunction && specData.callBackFunction !== '') {
      this.commonService[specData.callBackFunction](
        this.headerData,
        specData.redirectURL,
        appConstants.ListViewIdKeyMapping.centers.idKey
      );
    }
  }
}
