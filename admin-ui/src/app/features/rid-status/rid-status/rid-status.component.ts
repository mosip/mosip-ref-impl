import { Component, OnDestroy, OnInit } from '@angular/core';
import { RequestModel } from 'src/app/core/models/request.model';
import { SortModel } from 'src/app/core/models/sort.model';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { AppConfigService } from 'src/app/app-config.service';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import * as ridConfig from 'src/assets/entity-spec/rid-status.json';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import Utils from 'src/app/app.utils';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { AuditService } from 'src/app/core/services/audit.service';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-rid-status',
  templateUrl: './rid-status.component.html',
  styleUrls: ['./rid-status.component.scss']
})
export class RidStatusComponent implements OnInit {
  displayedColumns = [];
  actionButtons = [];
  actionEllipsis = [];
  paginatorOptions: any;
  sortFilter = [];
  primaryLang: string;  
  pagination = new PaginationModel();
  centerRequest = {} as CenterRequest;
  requestModel: RequestModel;
  datas = [];
  subscribed: any;
  errorMessages: any;
  noData = false;
  filtersApplied = false;

  constructor(
    private dataStroageService: DataStorageService,
    private appService: AppConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private headerService: HeaderService,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private auditService: AuditService
  ) {
    this.getridConfigs();
    this.primaryLang = this.headerService.getUserPreferredLanguage();
    
    this.translateService.use(this.primaryLang);
    translateService.getTranslation(this.primaryLang).subscribe(response => {
      console.log(response);
      this.errorMessages = response.errorPopup;
    });
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.getridDetails();
      }
    });
  }

  ngOnInit() {
    this.auditService.audit(5, 'ADM-045');
  }

  getridConfigs() {
    this.displayedColumns = ridConfig.columnsToDisplay;
    console.log(this.displayedColumns);
    this.actionButtons = ridConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'ellipsis'
    );
    this.actionEllipsis = ridConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'button'
    );
    this.paginatorOptions = ridConfig.paginator;
  }

  pageEvent(event: any) {
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.primaryLang);
    filters.pagination.pageFetch = event.pageSize;
    filters.pagination.pageStart = event.pageIndex;
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl(`admin/rid-status/view?${url}`);
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
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.primaryLang);
    filters.sort = this.sortFilter;
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl('admin/rid-status/view?' + url);
  }

  getridDetails() {
    this.datas = [];
    this.noData = false;
    this.filtersApplied = false;
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.primaryLang);
    if (filters.filters.length > 0) {
      this.filtersApplied = true;
    }
    this.sortFilter = filters.sort;
    if(this.sortFilter.length == 0){
      this.sortFilter.push({"sortType":"desc","sortField":"createdDateTime"});      
    }
    this.requestModel = new RequestModel(null, null, filters);
    console.log(JSON.stringify(this.requestModel));
    this.dataStroageService
      .getridDetails(this.requestModel)
      .subscribe(({ response, errors }) => {
        console.log(response);
        if (response != null) {
          this.paginatorOptions.totalEntries = response.totalRecord;
          this.paginatorOptions.pageIndex = filters.pagination.pageStart;
          this.paginatorOptions.pageSize = filters.pagination.pageFetch;
          console.log(this.paginatorOptions);
          if (response.data != null) {
            this.datas = [...response.data];
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
// tslint:disable-next-line:align
ngOnDestroy() {
    this.subscribed.unsubscribe();
  }
}
