import { Component, OnInit } from '@angular/core';
import { AuditService } from 'src/app/core/services/audit.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';
import * as userConfig from 'src/assets/entity-spec/user.json';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  displayedColumns = [];
  actionButtons = [];
  actionEllipsis = [];
  paginatorOptions: any;

  keycloakUrl =
    location.origin+'/keycloak/auth/admin/master/console/#/realms/mosip/users';

  constructor(
    private auditService: AuditService,
    private translate: TranslateService,
    private appService: AppConfigService
  ) {
    this.getUserConfigs();
    translate.use(appService.getConfig()['primaryLangCode']);
  }
  ngOnInit() {
    this.auditService.audit(3, 'ADM-042', 'users');
  }

  getUserConfigs() {
    this.displayedColumns = userConfig.columnsToDisplay;
    console.log(this.displayedColumns);
    this.actionButtons = userConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'ellipsis'
    );
    this.actionEllipsis = userConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'button'
    );
    this.paginatorOptions = userConfig.paginator;
  }
}