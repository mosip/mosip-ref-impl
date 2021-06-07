import { Component, OnInit } from '@angular/core';
import { AuditService } from '../services/audit.service';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { DataStorageService } from 'src/app/core/services/data-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  primaryLang: string;
  labels:any;

  constructor(private auditService: AuditService, private dataStorageService: DataStorageService, private translateService: TranslateService, private headerService: HeaderService) { }

  ngOnInit() {
  	this.primaryLang = this.headerService.getUserPreferredLanguage();
    this.translateService.use(this.primaryLang);
    this.dataStorageService
    .getI18NLanguageFiles(this.primaryLang)
    .subscribe((response) => {
      this.labels = response["dashboard"];
    });
    this.auditService.audit(6, 'ADM-046');
  }

}
