import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import * as appConstants from '../../../app.constants';
import { AppConfigService } from 'src/app/app-config.service';
import { HeaderModel } from 'src/app/core/models/header.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { FilterModel } from 'src/app/core/models/filter.model';
import { RequestModel } from 'src/app/core/models/request.model';

@Component({
  selector: 'app-single-view',
  templateUrl: './single-view.component.html',
  styleUrls: ['./single-view.component.scss']
})
export class SingleViewComponent implements OnInit {
  specFileData: any;
  mapping: any;
  id: string;
  primaryLangCode: string;
  secondaryLangCode: string;
  primaryData: any;
  secondaryData: any;
  headerData: HeaderModel;

  fetchRequest = {} as CenterRequest;

  data = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataStorageService: DataStorageService,
    private appService: AppConfigService
  ) {}

  ngOnInit() {
    // tslint:disable-next-line:no-string-literal
    this.primaryLangCode = this.appService.getConfig()['primaryLangCode'];
    // tslint:disable-next-line:no-string-literal
    this.secondaryLangCode = this.appService.getConfig()['secondaryLangCode'];
    this.activatedRoute.params.subscribe(response => (this.id = response.id));
    this.loadData();
  }

 async loadData() {
    const routeParts = this.router.url.split('/');
    this.mapping =
      appConstants.masterdataMapping[routeParts[routeParts.length - 3]];
    this.dataStorageService
      .getSpecFileForMasterDataEntity(this.mapping.specFileName)
      .subscribe(response => {
        this.specFileData = response.columnsToDisplay;
        console.log(this.specFileData);
      });
    await this.getData(this.primaryLangCode, true);
    await this.getData(this.secondaryLangCode, false);
    console.log(this.primaryData, this.secondaryData);
    this.setHeaderData();
  }

  setHeaderData() {
    this.headerData = new HeaderModel(
      this.primaryData[this.mapping.nameKey],
      this.primaryData.createdDateTime ? this.primaryData.createdDateTime : '-',
      this.primaryData.createdBy ? this.primaryData.createdBy : '-',
      this.primaryData.updatedDateTime ? this.primaryData.updatedDateTime : '-',
      this.primaryData.updatedBy ? this.primaryData.updatedBy : '-'
    );
  }

  getData(language: string, isPrimary: boolean) {
    return new Promise((resolve, reject) => {
    const filterModel = new FilterModel(this.mapping.idKey, 'equals', this.id);
    this.fetchRequest.filters = [filterModel];
    this.fetchRequest.languageCode = language;
    this.fetchRequest.sort = [];
    this.fetchRequest.pagination = {pageStart: 0, pageFetch: 10};
    const request = new RequestModel(appConstants.registrationCenterCreateId, null, this.fetchRequest);
    this.dataStorageService
      .getMasterDataByTypeAndId(this.mapping.apiName, request)
      .subscribe(response => {
        this.data.push(response.response.data);
        if (isPrimary) {
           this.primaryData = response.response.data[0];
        } else {
           this.secondaryData = response.response.data[0];
        }
        resolve(true);
      });
    });
  }
}
