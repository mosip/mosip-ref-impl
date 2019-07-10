import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: 'app-mater-data-common-view',
  templateUrl: './mater-data-common-view.component.html',
  styleUrls: ['./mater-data-common-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MaterDataCommonViewComponent implements OnInit {

  secondaryLanguageLabels: any;
  primaryLang: string;
  secondaryLang: string;

  constructor(private translateService: TranslateService, private appConfigService: AppConfigService) {
    // tslint:disable-next-line:no-string-literal
    this.primaryLang = appConfigService.getConfig()['primaryLangCode'];
    // tslint:disable-next-line:no-string-literal
    this.secondaryLang = appConfigService.getConfig()['secondaryLangCode'];
    translateService.use(this.primaryLang);
  }

  ngOnInit() {
  }

}
