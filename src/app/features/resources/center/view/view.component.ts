import { Component, OnInit, OnChanges } from '@angular/core';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { CenterService } from 'src/app/core/services/center.service';
import { RequestModel } from 'src/app/core/models/request.model';
import { AppConfigService } from 'src/app/app-config.service';
import { SortModel } from 'src/app/core/models/sort.model';
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit, OnChanges {
  constructor(
    private dataStroageService: DataStorageService,
    private centerService: CenterService,
    private appService: AppConfigService
  ) {
    this.getCenterConfigs();
  }
  displayedColumns: [];
  actionButtons: [];
  actionEllipsis: [];
  paginatorOptions: any;
  resourceFilter = {
    case: 'center'
  };
  pagination = {
    pageFetch: 10,
    pageStart: 0
  };
  sortFilter: any;
  centerRequest = {} as CenterRequest;
  requestModel: RequestModel;
  centers = [];
  ngOnInit() {
    this.sortFilter = [];
    if (this.paginatorOptions !== null || this.paginatorOptions !== undefined) {
      this.getRegistrationCenters();
    }
  }
  ngOnChanges() {
    this.ngOnInit();
  }

  getCenterConfigs() {
    this.dataStroageService
      .getCenterSpecificLabelsAndActions()
      .subscribe(({ eng }) => {
        console.log(eng.columnsToDisplay);
        this.displayedColumns = eng.columnsToDisplay;
        console.log(this.displayedColumns);
        this.actionButtons = eng.actionButtons.filter(
          value => value.showIn.toLowerCase() === 'ellipsis'
        );
        this.actionEllipsis = eng.actionButtons.filter(
          value => value.showIn.toLowerCase() === 'button'
        );
        this.paginatorOptions = eng.paginator;
        console.log(this.paginatorOptions);
      });
  }

  pageEvent(event: any) {
    console.log(event);
    if (event) {
      this.pagination.pageFetch = event.pageSize;
      this.pagination.pageStart = event.pageIndex;
      this.getRegistrationCenters();
    }
  }

  getSortColumn(event) {
    console.log(event);
    this.sortFilter.push(event);
    console.log(this.sortFilter);
  }

  getRegistrationCenters() {
    this.centers = [];
    this.centerRequest.filters = [],
    this.centerRequest.pagination = this.pagination;
    this.centerRequest.sort = this.sortFilter,
    this.centerRequest.languageCode = this.appService.getConfig().primaryLangCode;
    this.requestModel = new RequestModel(null, null, this.centerRequest);
    console.log(JSON.stringify(this.requestModel));
    this.centerService
      .getRegistrationCentersDetails(this.requestModel)
      .subscribe(({ response, errors }) => {
        console.log(response);
        if (response != null) {
          this.paginatorOptions.totalEntries = response.totalRecord;
          this.centers = [...response.data];
          console.log(this.centers);
        }
      });
  }
}
