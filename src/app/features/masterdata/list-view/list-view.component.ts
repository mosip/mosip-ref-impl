import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as appConstants from 'src/app/app.constants';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { RequestModel } from 'src/app/core/models/request.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import { SortModel } from 'src/app/core/models/sort.model';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss']
})
export class ListViewComponent implements OnInit {

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
  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private appService: AppConfigService
  ) {}

  async ngOnInit() {
    console.log(this.router.url);
    await this.loadData();
    await this.getMasterDataTypeValues();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      const routeParts = this.router.url.split('/')[3];
      this.mapping = appConstants.masterdataMapping[`${routeParts}`];
      this.headerName = appConstants.masterdataMapping[`${routeParts}`].headerName;
      console.log(this.mapping);
      this.dataStorageService
        .getSpecFileForMasterDataEntity(this.mapping.specFileName)
        .subscribe(response => {
          console.log(response);
          this.displayedColumns = response.columnsToDisplay.filter(
            values => values.showInListView === 'true'
          );
          console.log(this.displayedColumns.length);
          this.actionButtons = response.actionButtons.filter(
            value => value.showIn.toLowerCase() === 'ellipsis'
          );
          console.log(this.actionButtons);
          this.actionEllipsis = response.actionButtons.filter(
            value => value.showIn.toLowerCase() === 'button'
          );
          console.log(this.actionEllipsis);
          this.paginatorOptions = response.paginator;
          console.log(this.paginatorOptions);
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
    this.getMasterDataTypeValues();
  }
  pageEvent(event: any) {
    console.log(event);
    if (event) {
      this.pagination.pageFetch = event.pageSize;
      this.pagination.pageStart = event.pageIndex;
      this.getMasterDataTypeValues();
    }
  }

  getMasterDataTypeValues() {
    return new Promise((resolve, reject) => {
      const routeParts = this.router.url.split('/')[3];
      this.mapping = appConstants.masterdataMapping[`${routeParts}`];
      this.centerRequest.filters = [],
      this.centerRequest.pagination = this.pagination;
      this.centerRequest.sort = this.sortFilter,
      this.centerRequest.languageCode = this.appService.getConfig().primaryLangCode;
      this.requestModel = new RequestModel(null, null, this.centerRequest);
      console.log(JSON.stringify(this.requestModel));
      this.dataStorageService
        .getMasterDataByTypeAndId(this.mapping.apiName, this.requestModel)
        .subscribe(({response}) => {
          console.log(response);
          this.paginatorOptions.totalEntries = response.totalRecord;
          this.masterData = [...response.data];
          console.log(this.masterData);
          resolve(true);
        });
    });
  }
}
