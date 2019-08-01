import { Component, OnDestroy } from '@angular/core';
import { RequestModel } from 'src/app/core/models/request.model';
import { SortModel } from 'src/app/core/models/sort.model';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { AppConfigService } from 'src/app/app-config.service';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import * as deviceConfig from 'src/assets/entity-spec/devices.json';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import Utils from 'src/app/app.utils';
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnDestroy {


  subscribed: any;


  constructor(
    private dataStroageService: DataStorageService,
    private appService: AppConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.getDevicesConfigs();
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.getDevices();
      }
    });
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
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.appService.getConfig().primaryLangCode);
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
          if(response.data != null) {
          this.devices = [...response.data];
        }
        }
      });
  }

  ngOnDestroy() {
    this.subscribed.unsubscribe();
  }
}
