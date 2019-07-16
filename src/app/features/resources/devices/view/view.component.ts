import { Component, OnInit } from '@angular/core';
import { RequestModel } from 'src/app/core/models/request.model';
import { SortModel } from 'src/app/core/models/sort.model';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { AppConfigService } from 'src/app/app-config.service';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import * as deviceConfig from 'src/assets/entity-spec/devices.json';
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  constructor(
    private dataStroageService: DataStorageService,
    private appService: AppConfigService
  ) {
    this.getDevicesConfigs();
  }
  displayedColumns = [];
  actionButtons = [];
  actionEllipsis = [];
  paginatorOptions: any;
  sortFilter = [];
  pagination = new PaginationModel();
  centerRequest = {} as CenterRequest;
  requestModel: RequestModel;
  devices = [];
  ngOnInit() {
    this.getDevices();
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
    console.log(event);
    if (event) {
      this.pagination.pageFetch = event.pageSize;
      this.pagination.pageStart = event.pageIndex;
      this.getDevices();
    }
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
    this.getDevices();
  }

  getDevices() {
    this.devices = [];
    (this.centerRequest.filters = []),
      (this.centerRequest.pagination = this.pagination);
    (this.centerRequest.sort = this.sortFilter),
      (this.centerRequest.languageCode = this.appService.getConfig().primaryLangCode);
    this.requestModel = new RequestModel(null, null, this.centerRequest);
    console.log(JSON.stringify(this.requestModel));
    this.dataStroageService
      .getDevicesData(this.requestModel)
      .subscribe(({ response, errors }) => {
        console.log(response);
        if (response != null) {
          this.paginatorOptions.totalEntries = response.totalRecord;
          this.devices = [...response.data];
        }
      });
  }
}
