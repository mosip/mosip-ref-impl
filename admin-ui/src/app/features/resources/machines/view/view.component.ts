import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { AppConfigService } from 'src/app/app-config.service';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import { RequestModel } from 'src/app/core/models/request.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import * as machinesConfig from 'src/assets/entity-spec/machines.json';
import { SortModel } from 'src/app/core/models/sort.model';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import Utils from 'src/app/app.utils';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { AuditService } from 'src/app/core/services/audit.service';
import { HeaderService } from 'src/app/core/services/header.service';

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
  machines = [];
  subscribed: any;
  errorMessages: any;
  noData = false;
  filtersApplied = false;

  constructor(
    private dataStroageService: DataStorageService,
    private appService: AppConfigService,
    private headerService: HeaderService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private auditService: AuditService
  ) {
    this.getMachinesConfigs();
    this.translateService.use(this.headerService.getUserPreferredLanguage());
    translateService.getTranslation(this.headerService.getUserPreferredLanguage()).subscribe(response => {
      console.log(response);
      this.errorMessages = response.errorPopup;
    });
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.getMachines();
      }
    });
  }

  ngOnInit() {
    this.auditService.audit(3, machinesConfig.auditEventIds[0], 'machines');
  }

  getMachinesConfigs() {
    this.displayedColumns = machinesConfig.columnsToDisplay;
    console.log(this.displayedColumns);
    this.actionButtons = machinesConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'ellipsis'
    );
    this.actionEllipsis = machinesConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'button'
    );
    this.paginatorOptions = machinesConfig.paginator;
  }

  pageEvent(event: any) {
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.headerService.getUserPreferredLanguage());
    filters.pagination.pageFetch = event.pageSize;
    filters.pagination.pageStart = event.pageIndex;
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl(`admin/resources/machines/view?${url}`);
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
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.headerService.getUserPreferredLanguage());
    filters.sort = this.sortFilter;
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl('admin/resources/machines/view?' + url);
  }

  getMachines() {
    this.machines = [];
    this.noData = false;
    this.filtersApplied = false;
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.headerService.getUserPreferredLanguage());
    if (filters.filters.length > 0) {
      this.filtersApplied = true;
    }
    this.sortFilter = filters.sort;
    if (this.sortFilter.length === 0) {
      this.sortFilter.push({'sortType': 'desc', 'sortField': 'createdDateTime'});
    }
    this.requestModel = new RequestModel(null, null, filters);
    console.log(this.requestModel);
    this.dataStroageService
      .getMachinesData(this.requestModel)
      .subscribe(({ response, errors }) => {
        if (response != null) {
          this.paginatorOptions.totalEntries = response.totalRecord;
          this.paginatorOptions.pageIndex = filters.pagination.pageStart;
          this.paginatorOptions.pageSize = filters.pagination.pageFetch;
          console.log(this.paginatorOptions);
          if (response.data !== null) {
            this.machines = response.data ? [...response.data] : [];
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
          //   })
          //   .afterClosed()
          //   .subscribe(result => {
          //     console.log('dislog is closed');
          //     this.router.navigateByUrl(
          //       `admin/resources/machines/view`
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

  ngOnDestroy() {
    this.subscribed.unsubscribe();
  }
}
