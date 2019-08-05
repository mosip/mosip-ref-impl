import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as appConstants from '../../app.constants';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { FormGroup, FormControl } from '@angular/forms';
import { RequestModel } from 'src/app/core/models/request.model';
import { FilterRequest } from 'src/app/core/models/filter-request.model';
import { FilterValuesModel } from 'src/app/core/models/filter-values.model';
import { AppConfigService } from 'src/app/app-config.service';
import Utils from 'src/app/app.utils';
import { FilterModel } from 'src/app/core/models/filter.model';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogComponent implements OnInit {
  input;
  confirm = true;
  FilterData = [];
  filterGroup = new FormGroup({});
  routeParts: string;
  filters = [];
  existingFilters: any;
  filtersRequest: FilterRequest;
  filterModel: FilterValuesModel;
  requestModel: RequestModel;
  options = [];

  filterOptions: any = {};

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private dataStorageService: DataStorageService,
    private config: AppConfigService,
    private activatedRoute: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.input = this.data;
    console.log(this.input);
    if (this.input.case === 'filter') {
      this.existingFilters = Utils.convertFilter(
        this.activatedRoute.snapshot.queryParams,
        this.config.getConfig().primaryLangCode
      ).filters;
      await this.getFilterMappings();
    }
  }

  onNoClick(): void {
    this.dialog.closeAll();
  }
  getFilterMappings() {
    return new Promise((resolve, reject) => {
      this.routeParts = this.router.url.split('/')[3];
      const specFileName =
        appConstants.FilterMapping[`${this.routeParts}`].specFileName;
      this.dataStorageService
        .getFiltersForListView(specFileName)
        .subscribe(response => {
          // tslint:disable-next-line:no-string-literal
          this.FilterData = [...response['filterColumns']];
          // tslint:disable-next-line:no-string-literal
          this.settingUpFilter(response['filterColumns']);
          resolve(true);
        });
    });
  }

  settingUpFilter(filterNames: any) {
    console.log(filterNames, this.existingFilters, this.filterOptions);
    filterNames.forEach(values => {
      const filterOption = this.existingFilters.filter(
        (filter: FilterModel) => filter.columnName === values.filtername
      );
      if (filterOption.length === 0) {
        this.filterGroup.addControl(values.filtername, new FormControl(''));
        this.filterOptions[values.filtername] = [];
      } else {
        this.filterGroup.addControl(
          values.filtername,
          new FormControl(filterOption[0].value)
        );
        if (values.autocomplete === 'false' && values.dropdown === 'false') {
          this.filterOptions[values.filtername] = [];
        } else {
          this.getFilterValues(
            values.fieldName,
            filterOption[0].value,
            values.apiName,
            filterOption[0].columnName
          );
        }
      }
    });
  }
  getFilterValuesOnSubmit() {
    this.existingFilters = [];
    console.log(this.filterGroup);
    Object.keys(this.filterGroup.controls).forEach(key => {
      const filter = this.FilterData.filter(data => data.filtername === key);
      if (
        this.filterGroup.controls[key].value &&
        this.filterGroup.controls[key].value !== ''
      ) {
        let filterType = '';
        if (
          filter[0].dropdown === 'false' &&
          filter[0].autocomplete === 'false'
        ) {
          console.log(
            typeof this.filterGroup.controls[key].value,
            this.filterGroup.controls[key].value
          );
          if (
            this.filterGroup.controls[key].value.toString().charAt(0) === '*'
          ) {
            filterType = 'startsWith';
          } else {
            filterType = 'contains';
          }
        } else if (
          filter[0].dropdown === 'false' &&
          filter[0].autocomplete === 'true'
        ) {
          if (
            this.filterGroup.controls[key].value.toString().charAt(0) === '*'
          ) {
            filterType = 'startsWith';
          } else {
            filterType = 'contains';
          }
        } else if (
          filter[0].dropdown === 'true' &&
          filter[0].autocomplete === 'false'
        ) {
          filterType = 'equals';
        }
        const filterObject = new FilterModel(
          key,
          filterType,
          // tslint:disable-next-line:max-line-length
          this.filterGroup.controls[key].value.indexOf('*') === -1 ? this.filterGroup.controls[key].value : this.filterGroup.controls[key].value.replace(/\*/g, '')
        );
        this.existingFilters.push(filterObject);
      }
    });
    const filters = Utils.convertFilter(
      this.activatedRoute.snapshot.queryParams,
      this.config.getConfig().primaryLangCode
    );
    filters.filters = this.existingFilters;
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl(this.router.url.split('?')[0] + '?' + url);
  }

  getControlName(
    controlName: string,
    type: string,
    fieldName: string,
    value: string
  ) {
    if (fieldName.toLowerCase() === 'zone') {
      this.getZoneFilterValues();
    } else {
      console.log(type);
      this.getFilterValues(fieldName, value, type, controlName);
    }
  }

  getControlValues(controlName, type, fieldName, value) {
    if (fieldName.toLowerCase() === 'zone') {
      this.getZoneFilterValues();
    } else {
      console.log(type);
      this.getFilterValues(fieldName, value, type, controlName);
    }
  }

  getFilterValues(
    columnName: string,
    value: string,
    type: string,
    controlName: string
  ) {
    this.options = [];
    this.filters = [];
    const apitype = type;
    this.filterModel = new FilterValuesModel(
      columnName,
      'unique',
      value === undefined ? '' : value
    );
    this.filters = [this.filterModel];
    this.filtersRequest = new FilterRequest(
      this.filters,
      this.config.getConfig().primaryLangCode
    );
    this.requestModel = new RequestModel('', null, this.filtersRequest);
    console.log(this.requestModel);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes(apitype, this.requestModel)
      .subscribe(response => {
        console.log(response);
        this.filterOptions[controlName] = [...response.response.filters];
        console.log(this.filterOptions);
      });
  }

  getZoneFilterValues() {
    this.options = [];
    this.filterOptions['Zone'] = [];
    this.dataStorageService
      .getZoneData(this.config.getConfig().primaryLangCode)
      .subscribe(response => {
        response.response.forEach(element => {
          const zoneObject = {
            fieldValue: element.name
          };
          this.filterOptions['Zone'].push(zoneObject);
        });
        console.log(response);
      });
  }

}
