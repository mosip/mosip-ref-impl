import { Component, OnDestroy, OnInit } from '@angular/core';
import { RequestModel } from 'src/app/core/models/request.model';
import { SortModel } from 'src/app/core/models/sort.model';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { AppConfigService } from 'src/app/app-config.service';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import * as pmanagerConfig from 'src/assets/entity-spec/pmanager.json';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import Utils from 'src/app/app.utils';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { AuditService } from 'src/app/core/services/audit.service';
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  //styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit, OnDestroy {

  displayedColumns = [];
  actionButtons = [];
  actionEllipsis = [];
  paginatorOptions: any;
  sortFilter = [];
  pagination = new PaginationModel();
  centerRequest = {} as CenterRequest;
  requestModel: RequestModel;
  pmanager = [];
  subscribed: any;
  errorMessages: any;
  noData = false;
  filtersApplied = false;

  constructor(
    private dataStroageService: DataStorageService,
    private appService: AppConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private auditService: AuditService
  ) {
    this.getPmanagerConfigs();
    translateService.getTranslation(appService.getConfig().primaryLangCode).subscribe(response => {
      console.log(response);
      this.errorMessages = response.errorPopup;
    });
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.getPmanagers();
      }
    });
  }

  ngOnInit() {
    this.auditService.audit(3, pmanagerConfig.auditEventIds[0], 'pmanager');
  }

  getPmanagerConfigs() {
    this.displayedColumns = pmanagerConfig.columnsToDisplay;
    console.log(this.displayedColumns);
    this.actionButtons = pmanagerConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'ellipsis'
    );
    this.actionEllipsis = pmanagerConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'button'
    );
    this.paginatorOptions = pmanagerConfig.paginator;
  }

  pageEvent(event: any) {
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.appService.getConfig().primaryLangCode);
    filters.pagination.pageFetch = event.pageSize;
    filters.pagination.pageStart = event.pageIndex;
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl(`admin/resources/pmanager/view?${url}`);
  }

  getSortColumn(event: SortModel) {
    console.log(event);
    this.sortFilter.forEach(element => {
      if (element.sortField === event.sortField) {
        const index = this.sortFilter.indexOf(element);
        this.sortFilter.splice(index, 1);
      }
    });
    if (event.sortType != null) {
    this.sortFilter.push(event);
  }
    console.log(this.sortFilter);
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.appService.getConfig().primaryLangCode);
    filters.sort = this.sortFilter;
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl('admin/resources/pmanager/view?' + url);
  }

  getPmanagers() {
    this.pmanager = [];
    this.noData = false;
    this.filtersApplied = false;
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.appService.getConfig().primaryLangCode);
    if (filters.filters.length > 0) {
      this.filtersApplied = true;
    }
    this.sortFilter = filters.sort;
    this.requestModel = new RequestModel(null, null, filters);
    console.log(JSON.stringify(this.requestModel));
    this.dataStroageService
      .getPartnerManagerData(this.requestModel)
      .subscribe(({ response, errors }) => {
        console.log(response);
        if (response != null) {
          this.paginatorOptions.totalEntries = response.totalRecord;
          this.paginatorOptions.pageIndex = filters.pagination.pageStart;
          this.paginatorOptions.pageSize = filters.pagination.pageFetch;
          console.log(this.paginatorOptions);
          if (response.partners != null) {
            this.pmanager = [...response.partners];
          } else {
            this.noData = true;
         }
      } else {
        this.dialog
          .open(DialogComponent, {
             data: {
              case: 'MESSAGE',
              title: this.errorMessages.technicalError.title,
              message: this.errorMessages.technicalError.message,
              btnTxt: this.errorMessages.technicalError.btnTxt
             } ,
            width: '700px'
          })
          .afterClosed()
          .subscribe(result => {
            console.log('dialog is closed from view component');
          });
      }

      });
  }
ngOnDestroy() {
    this.subscribed.unsubscribe();
  }
}
