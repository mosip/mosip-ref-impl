import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';
import { HeaderModel } from 'src/app/core/models/header.model';

@Component({
  selector: 'app-pmanager-header',
  templateUrl: './pmanager-header.component.html'
})
export class PmanagerHeaderComponent implements OnInit {

  @Input() headerData: HeaderModel;

  constructor(private translateService: TranslateService, private appService: AppConfigService) {
    translateService.use(appService.getConfig().primaryLangCode);
  }

  ngOnInit() {
  }

}
