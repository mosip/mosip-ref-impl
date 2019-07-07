import { Component, OnInit, OnChanges } from '@angular/core';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { CenterService } from 'src/app/core/services/center.service';
import { RequestModel } from 'src/app/core/models/request.model';
import { AppConfigService } from 'src/app/app-config.service';
import { SortModel } from 'src/app/core/models/sort.model';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import * as centerConfig from 'src/assets/entity-spec/center-entity-spec.json';
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
  displayedColumns = [];
  actionButtons = [];
  actionEllipsis = [];
  paginatorOptions: any;
  resourceFilter = {
    case: 'center'
  };
  sortFilter = [];
  pagination = new PaginationModel();
  centerRequest = {} as CenterRequest;
  requestModel: RequestModel;
  centers = [];
  ngOnInit() {
    this.getRegistrationCenters();
  }
  ngOnChanges() {
  }

  getCenterConfigs() {
    this.displayedColumns = centerConfig.eng.columnsToDisplay;
    console.log(this.displayedColumns);
    this.actionButtons = centerConfig.eng.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'ellipsis'
    );
    this.actionEllipsis = centerConfig.eng.actionButtons.filter(
      value => value.showIn.toLowerCase() === 'button'
    );
    this.paginatorOptions = centerConfig.eng.paginator;
  }

  pageEvent(event: any) {
    console.log(event);
    if (event) {
      this.pagination.pageFetch = event.pageSize;
      this.pagination.pageStart = event.pageIndex;
      this.getRegistrationCenters();
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
    this.sortFilter.push(event);
    console.log(this.sortFilter);
    this.getRegistrationCenters();
  }

  getRegistrationCenters() {
    this.centers = [];
    (this.centerRequest.filters = []),
      (this.centerRequest.pagination = this.pagination);
    (this.centerRequest.sort = this.sortFilter),
      (this.centerRequest.languageCode = this.appService.getConfig().primaryLangCode);
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
        } else if (errors != null) {
          console.log(errors);
        }
      });
  }
}
