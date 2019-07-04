import { Component, OnInit } from '@angular/core';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { CenterService } from 'src/app/core/services/center.service';
import { RequestModel } from 'src/app/core/models/request.model';
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  constructor(
    private dataStroageService: DataStorageService,
    private centerService: CenterService
  ) {}
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
  centerRequest = {} as CenterRequest;
  requestModel: RequestModel;
  centers = [];
  ngOnInit() {
    this.getCenterConfigs();
    this.getRegistrationCenters();
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

  getRegistrationCenters() {
    this.centers = [];
    this.centerRequest.filters = [],
    this.centerRequest.pagination = this.pagination;
    this.centerRequest.sort = [],
    this.centerRequest.languageCode = 'eng';
    this.requestModel = new RequestModel(null, null, this.centerRequest);
    console.log(JSON.stringify(this.requestModel));
    this.centerService
      .getRegistrationCentersDetails(this.requestModel)
      .subscribe(({response}) => {
        this.paginatorOptions.totalEntries = response.totalRecord;
        console.log(response);
        if (response != null) {
          this.centers = [...response.data];
          console.log(this.centers);
        }
      });
  }
}
