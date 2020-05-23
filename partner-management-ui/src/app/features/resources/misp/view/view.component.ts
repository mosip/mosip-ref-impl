import { Component, OnDestroy, OnInit } from '@angular/core';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { MispService } from 'src/app/core/services/misp.service';
import { RequestModel } from 'src/app/core/models/request.model';
import { AppConfigService } from 'src/app/app-config.service';
import { SortModel } from 'src/app/core/models/sort.model';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import * as mispConfig from 'src/assets/entity-spec/misp.json';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import Utils from '../../../../app.utils';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { AuditService } from 'src/app/core/services/audit.service';
import { MispLicenseModel } from 'src/app/core/models/misplicense.model';
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
  misps = [];
  mispLicense:MispLicenseModel;
  subscribed: any;
  errorMessages: any;
  noData = false;
  filtersApplied = false;

  constructor(
    private mispService: MispService,
    private appService: AppConfigService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private auditService: AuditService
  ) {
    this.getMispConfigs();
    this.translateService.getTranslation(appService.getConfig().primaryLangCode).subscribe(response => {
      console.log(response);
      this.errorMessages = response.errorPopup;
    });
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.getRegistredMisps();
      }
    });
  }


  ngOnInit() {
    this.auditService.audit(3, mispConfig.auditEventIds[0], 'misp');
  }

  OrderByArray(values: any[], orderType: any) { 
    return values.sort((a, b) => {
        if (a[orderType] < b[orderType]) {
            return -1;
        }

        if (a[orderType] > b[orderType]) {
            return 1;
        }

        return 0
    });
  }

  getMispConfigs() {
    this.displayedColumns = mispConfig.mispList;
    console.log(this.displayedColumns);
    this.actionButtons = mispConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'ellipsis'
    );
    this.actionEllipsis = mispConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'button'
    );
    this.paginatorOptions = mispConfig.paginator;
  }

  pageEvent(event: any) {
    const filters = Utils.convertFilter(
      this.activatedRoute.snapshot.queryParams,
      this.appService.getConfig().primaryLangCode
    );
    filters.pagination.pageFetch = event.pageSize;
    filters.pagination.pageStart = event.pageIndex;
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl(`admin/resources/misp/view?${url}`);
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
    const filters = Utils.convertFilter(
      this.activatedRoute.snapshot.queryParams,
      this.appService.getConfig().primaryLangCode
    );
    filters.sort = this.sortFilter;
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl('admin/resources/misp/view?' + url);
  }

  getRegistredMisps() {
    this.misps = [];
    this.noData = false;
    this.filtersApplied = false;
    const filters = Utils.convertFilter(
      this.activatedRoute.snapshot.queryParams,
      this.appService.getConfig().primaryLangCode
    );
    if (filters.filters.length > 0) {
      this.filtersApplied = true;
    }
    this.sortFilter = filters.sort;
    this.requestModel = new RequestModel("", null, filters);
    console.log(JSON.stringify(this.requestModel));
    this.mispService
      .getRegistrationMispDetails(this.requestModel)
      .subscribe(({ response, errors }) => {
        console.log(response);
        if (response != null) {
          this.paginatorOptions.totalEntries = response.totalRecord;
          this.paginatorOptions.pageIndex = filters.pagination.pageStart;
          this.paginatorOptions.pageSize = filters.pagination.pageFetch;
          console.log(this.paginatorOptions);
          if (response.mispList !== null) {
            console.log(response.mispList);
            console.log(...response.mispList);
            this.misps = response.mispList ? [...response.mispList] : [];            
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
