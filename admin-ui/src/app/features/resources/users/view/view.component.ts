import { Component, OnInit } from '@angular/core';
import { AuditService } from 'src/app/core/services/audit.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  keycloakUrl =
    'https://mosipkeycloak.southindia.cloudapp.azure.com/auth/admin/master/console/#/realms/mosip/users';

  constructor(
    private auditService: AuditService,
    private translate: TranslateService,
    private appService: AppConfigService
  ) {
    translate.use(appService.getConfig()['primaryLangCode']);
  }
  ngOnInit() {
    this.auditService.audit(3, 'ADM-042', 'users');
  }
}
