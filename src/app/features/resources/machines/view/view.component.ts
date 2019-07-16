import { Component, OnInit } from '@angular/core';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { AppConfigService } from 'src/app/app-config.service';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import { RequestModel } from 'src/app/core/models/request.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import * as machinesConfig from 'src/assets/entity-spec/machines.json';
import { SortModel } from 'src/app/core/models/sort.model';

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
    this.getMachinesConfigs();
  }
  displayedColumns = [];
  actionButtons = [];
  actionEllipsis = [];
  paginatorOptions: any;
  sortFilter = [];
  pagination = new PaginationModel();
  centerRequest = {} as CenterRequest;
  requestModel: RequestModel;
  machines = [];
  ngOnInit() {
    this.getMachines();
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
    console.log(event);
    if (event) {
      this.pagination.pageFetch = event.pageSize;
      this.pagination.pageStart = event.pageIndex;
      this.getMachines();
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
    this.getMachines();
  }

  getMachines() {
    this.machines = [];
    this.centerRequest.filters = [],
    this.centerRequest.pagination = this.pagination;
    this.centerRequest.sort = this.sortFilter,
    this.centerRequest.languageCode = this.appService.getConfig().primaryLangCode;
    this.requestModel = new RequestModel(null, null, this.centerRequest);
    console.log(this.requestModel);
    this.dataStroageService
      .getMachinesData(this.requestModel)
      .subscribe(({ response, errors }) => {
        if (response != null) {
          this.paginatorOptions.totalEntries = response.totalRecord;
          this.machines = [...response.data];
        }
      });
  }
}
