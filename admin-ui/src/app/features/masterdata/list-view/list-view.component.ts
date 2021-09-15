import { Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import * as appConstants from 'src/app/app.constants';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { RequestModel } from 'src/app/core/models/request.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import { SortModel } from 'src/app/core/models/sort.model';
import { AppConfigService } from 'src/app/app-config.service';
import Utils from 'src/app/app.utils';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { AuditService } from 'src/app/core/services/audit.service';
import { HeaderService } from "src/app/core/services/header.service";
import defaultJson from "../../../../assets/i18n/default.json";

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss']
})
export class ListViewComponent implements OnDestroy {
  headerName: string;
  displayedColumns = [];
  actionButtons = [];
  actionEllipsis = [];
  paginatorOptions: any;
  sortFilter = [];
  pagination = new PaginationModel();
  centerRequest = {} as CenterRequest;
  requestModel: RequestModel;
  masterData = [];
  mapping: any;
  errorMessages: any;
  subscribed: any;
  noData = false;
  filtersApplied = false;
  masterDataType: string;
  auditEventId: string[];
  primaryLang: string;
  masterDataName: string;

  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private appService: AppConfigService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private auditService: AuditService, 
    private headerService: HeaderService
  ) {
    this.primaryLang = this.headerService.getUserPreferredLanguage();

    this.translateService.use(this.primaryLang);
    translateService
      .getTranslation(this.primaryLang)
      .subscribe(response => {
        this.errorMessages = response.errorPopup;
      });
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });
  }

  async initializeComponent() {
    await this.loadData();
    if (this.activatedRoute.snapshot.params.type !== this.masterDataType) {
      this.masterDataType = this.activatedRoute.snapshot.params.type;
      this.auditService.audit(3, this.auditEventId[0], this.masterDataType);
    }
    if (this.masterDataType.toLowerCase() === 'blacklisted-words') {
      await this.loadBlacklistedWords();
    } else {
      await this.getMasterDataTypeValues(
        this.primaryLang
      );
    }
  }

  loadBlacklistedWords() {
    return new Promise(async (resolve, reject) => {
      const data = [];
      await this.getMasterDataTypeValues('all').then(response => {
        if (response['data']) {
          data.push(...response['data']);
          console.log(response);
        }
      });
      this.masterData = data;      
      this.paginatorOptions.totalEntries = this.masterData.length;
      resolve(true);
    });
  }

  loadData() {
    return new Promise((resolve, reject) => {
      const routeParts = this.activatedRoute.snapshot.params.type;
      this.mapping = appConstants.masterdataMapping[`${routeParts}`];
      this.masterDataName = defaultJson.masterdataMapping[`${routeParts}`].name[this.primaryLang];
      this.headerName =
        appConstants.masterdataMapping[`${routeParts}`].headerName;
      this.dataStorageService
        .getSpecFileForMasterDataEntity(this.mapping.specFileName)
        .subscribe(response => {
          this.displayedColumns = response.columnsToDisplay.filter(
            values => values.showInListView === 'true'
          );
          this.actionButtons = response.actionButtons.filter(
            value => value.showIn.toLowerCase() === 'ellipsis'
          );
          this.actionEllipsis = response.actionButtons.filter(
            value => value.showIn.toLowerCase() === 'button'
          );
          this.paginatorOptions = response.paginator;
          this.auditEventId = response.auditEventIds;
          resolve(true);
        });
    });
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
    if(this.activatedRoute.snapshot.params.dynamicfieldtype){
      this.router.navigateByUrl(
      `admin/masterdata/${this.activatedRoute.snapshot.params.type}/${this.activatedRoute.snapshot.params.dynamicfieldtype}/view?${url}`
      );
    }else{
      this.router.navigateByUrl(
      `admin/masterdata/${this.activatedRoute.snapshot.params.type}/view?${url}`
      );
    }
  }
  pageEvent(event: any) {
    const filters = Utils.convertFilter(
      this.activatedRoute.snapshot.queryParams,
      this.appService.getConfig().primaryLangCode
    );
    filters.pagination.pageFetch = event.pageSize;
    filters.pagination.pageStart = event.pageIndex;
    const url = Utils.convertFilterToUrl(filters);
    if(this.activatedRoute.snapshot.params.dynamicfieldtype){
      this.router.navigateByUrl(
      `admin/masterdata/${this.activatedRoute.snapshot.params.type}/${this.activatedRoute.snapshot.params.dynamicfieldtype}/view?${url}`
      );
    }else{
      this.router.navigateByUrl(
      `admin/masterdata/${this.activatedRoute.snapshot.params.type}/view?${url}`
      );
    }    
  }

  getMasterDataTypeValues(language: string) {
    return new Promise((resolve, reject) => {
      this.masterData = [];
      this.noData = false;
      this.filtersApplied = false;
      const routeParts = this.activatedRoute.snapshot.params.type;
      this.mapping = appConstants.masterdataMapping[`${routeParts}`];
      const filters = Utils.convertFilter(
        this.activatedRoute.snapshot.queryParams,
        language
      );
      if (filters.filters.length > 0) {
        this.filtersApplied = true;
      }
      this.sortFilter = filters.sort;
      if(this.sortFilter.length == 0){
        this.sortFilter.push({"sortType":"desc","sortField":"createdDateTime"});      
      }     
      this.requestModel = new RequestModel(null, null, filters);
      if(this.activatedRoute.snapshot.params.dynamicfieldtype){        
        this.requestModel.request.filters.push({columnName: "name", type: "contains", value: this.activatedRoute.snapshot.params.dynamicfieldtype});
      }
      this.dataStorageService
        .getMasterDataByTypeAndId(this.mapping.apiName, this.requestModel)
        .subscribe(({ response }) => {
          console.log(this.paginatorOptions);
          if (response != null) {
            this.paginatorOptions.totalEntries = response.totalRecord;
            this.paginatorOptions.pageIndex = filters.pagination.pageStart;
            this.paginatorOptions.pageSize = filters.pagination.pageFetch;
            if (response.data !== null) {
              this.masterData = response.data ? [...response.data] : [];
              this.masterData.forEach(function (value, index) {
                value["code"] = value.fieldVal["code"];
                value["value"] = value.fieldVal["value"];
              }); 
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
                },
                width: '700px'
              })
              .afterClosed()
              .subscribe(result => {
                console.log('dialog is closed from view component');
              });
          }
          resolve(response);
        });
    });
  }

  changePage() {
    this.router.navigateByUrl('admin/masterdata/home');
  }

  ngOnDestroy() {
    this.subscribed.unsubscribe();
  }
}
