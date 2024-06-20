import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import * as appConstants from '../../../app.constants';
import { AppConfigService } from 'src/app/app-config.service';
import { HeaderModel } from 'src/app/core/models/header.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { FilterModel } from 'src/app/core/models/filter.model';
import { RequestModel } from 'src/app/core/models/request.model';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AuditService } from 'src/app/core/services/audit.service';

@Component({
  selector: 'app-single-view',
  templateUrl: './single-view.component.html',
  styleUrls: ['./single-view.component.scss']
})
export class SingleViewComponent implements OnDestroy {
  specFileData: any;
  mapping: any;
  id: string;
  primaryLangCode: string;
  secondaryLangCode: string;
  primaryData: any;
  secondaryData: any;
  headerData: HeaderModel;
  showSpinner = true;

  subscribed: any;
  masterdataType: string;

  fetchRequest = {} as CenterRequest;

  data = [];

  popupMessages = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataStorageService: DataStorageService,
    private appService: AppConfigService,
    private dialog: MatDialog,
    private location: Location,
    private router: Router,
    private translate: TranslateService,
    private auditService: AuditService
  ) {
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });
  }

  async initializeComponent() {
    this.showSpinner = true;
    this.primaryLangCode = await this.appService.getConfig()['primaryLangCode'];
    this.secondaryLangCode = await this.appService.getConfig().secondaryLangCode;
    this.translate
      .getTranslation(this.primaryLangCode)
      .subscribe(response => (this.popupMessages = response.singleView));
    this.activatedRoute.params.subscribe(response => {
      this.id = response.id;
      this.masterdataType = response.type;
      this.mapping = appConstants.masterdataMapping[response.type];
    });
    this.loadData();
  }

  async loadData() {
    this.dataStorageService
      .getSpecFileForMasterDataEntity(this.mapping.specFileName)
      .subscribe(response => {
        this.specFileData = response.columnsToDisplay;
        console.log(this.specFileData);
        this.auditService.audit(8, response.auditEventIds[1], this.masterdataType);
      });
    if (this.masterdataType.toLowerCase() === 'blacklisted-words') {
      this.primaryLangCode = this.id.split('$')[1];
      this.id = this.id.split('$')[0];
      await this.getData(this.primaryLangCode, true);
    } else {
      await this.getData(this.primaryLangCode, true);
      await this.getData(this.secondaryLangCode, false);
    }
    console.log(this.primaryData, this.secondaryData);
    this.setHeaderData();
  }

  setHeaderData() {
    this.headerData = new HeaderModel(
      this.primaryData[this.mapping.nameKey],
      this.primaryData.createdDateTime ? this.primaryData.createdDateTime : '-',
      this.primaryData.createdBy ? this.primaryData.createdBy : '-',
      this.primaryData.updatedDateTime ? this.primaryData.updatedDateTime : '-',
      this.primaryData.updatedBy ? this.primaryData.updatedBy : '-'
    );
    this.showSpinner = false;
  }

  getData(language: string, isPrimary: boolean) {
    return new Promise((resolve, reject) => {
      const filterModel = new FilterModel(
        this.mapping.idKey,
        'equals',
        this.id
      );
      this.fetchRequest.filters = [filterModel];
      this.fetchRequest.languageCode = language;
      this.fetchRequest.sort = [];
      this.fetchRequest.pagination = { pageStart: 0, pageFetch: 10 };
      const request = new RequestModel(
        appConstants.registrationCenterCreateId,
        null,
        this.fetchRequest
      );
      this.dataStorageService
        .getMasterDataByTypeAndId(this.mapping.apiName, request)
        .subscribe(
          response => {
            if (response.response) {
              if (response.response.data) {
                this.data.push(response.response.data);
                if (isPrimary) {
                  this.primaryData = response.response.data[0];
                } else {
                  this.secondaryData = response.response.data[0];
                }
                resolve(true);
              } else {
                this.displayMessage(this.popupMessages['errorMessages'][0]);
              }
            } else {
              this.displayMessage(this.popupMessages['errorMessages'][0]);
            }
          },
          error => {
            this.displayMessage(this.popupMessages['errorMessages'][1]);
          }
        );
    });
  }

  displayMessage(message: string) {
    this.dialog
      .open(DialogComponent, {
        width: '350px',
        data: {
          case: 'MESSAGE',
          title: this.popupMessages['title'],
          message,
          btnTxt: this.popupMessages['buttonText']
        },
        disableClose: true
      })
      .afterClosed()
      .subscribe(() =>
        this.router.navigateByUrl(
          `admin/masterdata/${this.masterdataType}/view`
        )
      );
  }

  changePage(location: string) {
    if (location === 'home') {
      this.router.navigateByUrl('admin/masterdata/home');
    } else if (location === 'list') {
      this.router.navigateByUrl(
        `admin/masterdata/${this.masterdataType}/view`
      );
    }
  }

  ngOnDestroy() {
    this.subscribed.unsubscribe();
  }
}
