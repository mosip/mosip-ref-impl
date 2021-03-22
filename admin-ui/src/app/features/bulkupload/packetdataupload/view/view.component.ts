import { Component, OnDestroy, OnInit } from '@angular/core';
import { BulkuploadService } from 'src/app/core/services/bulkupload.service';
import { RequestModel } from 'src/app/core/models/request.model';
import { AppConfigService } from 'src/app/app-config.service';
import { SortModel } from 'src/app/core/models/sort.model';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import * as packetuploadConfig from 'src/assets/entity-spec/packetupload.json';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import Utils from '../../../../app.utils';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
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
  requestModel: RequestModel;
  datas = [];
  subscribed: any;
  errorMessages: any;
  noData = false;
  filtersApplied = false;

  constructor(
    private bulkuploadService: BulkuploadService,
    private appService: AppConfigService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private auditService: AuditService
  ) {
    this.getpacketuploadConfigs();
    this.translateService.use(appService.getConfig().primaryLangCode);
    this.translateService.getTranslation(appService.getConfig().primaryLangCode).subscribe(response => {
      console.log(response);
      this.errorMessages = response.errorPopup;
    });
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.getPacketUpload();
      }
    });
  }

  ngOnInit() {
    this.auditService.audit(3, packetuploadConfig.auditEventIds[0], 'packetupload');
  }

  getpacketuploadConfigs() {
    this.displayedColumns = packetuploadConfig.columnsToDisplay;
    console.log(this.displayedColumns);
    this.actionButtons = packetuploadConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'ellipsis'
    );
    this.actionEllipsis = packetuploadConfig.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'button'
    );
    this.paginatorOptions = packetuploadConfig.paginator;
  }

  pageEvent(event: any) {
    const filters = Utils.convertFilter(
      this.activatedRoute.snapshot.queryParams,
      this.appService.getConfig().primaryLangCode
    );
    filters.pagination.pageFetch = event.pageSize;
    filters.pagination.pageStart = event.pageIndex;
    console.log("filters>>>"+JSON.stringify(filters));
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl(`admin/bulkupload/packetupload/view?${url}`);
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
    this.router.navigateByUrl('admin/bulkupload/packetupload/view?' + url);
  }

  getPacketUpload() {
    this.datas = [];
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
    if(this.sortFilter.length == 0){
      this.sortFilter.push({"sortType":"desc","sortField":"timeStamp"});      
    }
    this.requestModel = new RequestModel(null, null, filters);
    console.log(JSON.stringify(this.requestModel));
    this.bulkuploadService
      .getUploadDetails(this.requestModel, "packet", filters.pagination.pageStart, filters.pagination.pageFetch)
      .subscribe(({ response, errors }) => {
        console.log(response);
        if (response != null) {
          this.paginatorOptions.totalEntries = response.totalItems;
          this.paginatorOptions.pageIndex = filters.pagination.pageStart;
          this.paginatorOptions.pageSize = filters.pagination.pageFetch;
          console.log(this.paginatorOptions);
          if (response.data !== null) {
            this.datas = response.data ? [...response.data] : [];
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
