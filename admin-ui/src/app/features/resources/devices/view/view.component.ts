import { Component, OnDestroy, OnInit } from '@angular/core';
import { RequestModel } from 'src/app/core/models/request.model';
import { SortModel } from 'src/app/core/models/sort.model';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { AppConfigService } from 'src/app/app-config.service';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import * as deviceConfig from 'src/assets/entity-spec/devices.json';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import Utils from 'src/app/app.utils';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { AuditService } from 'src/app/core/services/audit.service';
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
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
  devices = [];
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
    this.getDevicesConfigs();
    translateService.getTranslation(appService.getConfig().primaryLangCode).subscribe(response => {
      console.log(response);
      this.errorMessages = response.errorPopup;
    });
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.getDevices();
      }
    });
  }

  ngOnInit() {
    this.auditService.audit(3, deviceConfig.auditEventIds[0], 'devices');
  }

  getDevicesConfigs() {
    this.displayedColumns = deviceConfig.columnsToDisplay;
    console.log(this.displayedColumns);
    this.actionButtons = deviceConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'ellipsis'
    );
    this.actionEllipsis = deviceConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'button'
    );
    this.paginatorOptions = deviceConfig.paginator;
  }

  pageEvent(event: any) {
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.appService.getConfig().primaryLangCode);
    filters.pagination.pageFetch = event.pageSize;
    filters.pagination.pageStart = event.pageIndex;
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl(`admin/resources/devices/view?${url}`);
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
    this.router.navigateByUrl('admin/resources/devices/view?' + url);
  }

  getDevices() {
    this.devices = [];
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
      .getDevicesData(this.requestModel)
      .subscribe(({ response, errors }) => {
        console.log(response);
        if (response != null) {
          this.paginatorOptions.totalEntries = response.totalRecord;
          this.paginatorOptions.pageIndex = filters.pagination.pageStart;
          this.paginatorOptions.pageSize = filters.pagination.pageFetch;
          console.log(this.paginatorOptions);
          if (response.data != null) {
            this.devices = [...response.data];
          } else {
            this.noData = true;
        //   this.dialog
        //   .open(DialogComponent, {
        //      data: {
        //       case: 'MESSAGE',
        //       title: this.errorMessages.noData.title,
        //       message: this.errorMessages.noData.message,
        //       btnTxt: this.errorMessages.noData.btnTxt
        //      } ,
        //     width: '700px'
        //   }).afterClosed().subscribe( result => {
        //     this.router.navigateByUrl(
        //       `admin/resources/devices/view`
        //     );
        //   });
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
// tslint:disable-next-line:align
ngOnDestroy() {
    this.subscribed.unsubscribe();
  }
}
