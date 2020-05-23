import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { HeaderModel } from 'src/app/core/models/header.model';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { AppConfigService } from 'src/app/app-config.service';
import { CommonService } from 'src/app/core/services/common.service';
import { MispModel } from 'src/app/core/models/misp.model';
import * as appConstants from '../../../../app.constants';

@Component({
  selector: 'app-misp-header',
  templateUrl: './misp-header.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MispHeaderComponent implements OnInit {
  actionButtonElipses = new Array();

  lang: string;

  @Input() headerData: HeaderModel;
  @Input() data: MispModel;

  constructor(
    private dataSerice: DataStorageService,
    private appService: AppConfigService,
    private commonService: CommonService
  ) {
    this.lang = appService.getConfig()['primaryLangCode'];
  }

  ngOnInit() {
    this.dataSerice.getCenterSpecificLabelsAndActions().subscribe(data => {
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
        this.data,
        specData.redirectURL,
        appConstants.ListViewIdKeyMapping.misp.idKey
      );
    }
  }
}
