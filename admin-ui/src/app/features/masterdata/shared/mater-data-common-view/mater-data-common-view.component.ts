import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';
import { HeaderModel } from 'src/app/core/models/header.model';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-mater-data-common-view',
  templateUrl: './mater-data-common-view.component.html',
  styleUrls: ['./mater-data-common-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MaterDataCommonViewComponent implements OnInit {

  @Input() masterDataName: string;
  @Input() headerData: HeaderModel;
  @Input() primaryData: any;
  @Input() secondaryData: any;
  @Input() fields: any;
  @Input() primaryLang: string;
  @Input() secondaryLang: string;
  @Input() masterdataType: any;

  constructor(private translateService: TranslateService, private headerService: HeaderService, private appConfigService: AppConfigService) {
    // tslint:disable-next-line:no-string-literal
    this.primaryLang = this.headerService.getUserPreferredLanguage();
    // tslint:disable-next-line:no-string-literal
    this.secondaryLang = appConfigService.getConfig()['secondaryLangCode'];
    translateService.use(this.primaryLang);
  }

  ngOnInit() {
  }

}
