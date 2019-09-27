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
import { AuditService } from 'src/app/core/services/audit.service';

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
  momentDate: any;

  requiredError = false;
  rangeError = false;
  fieldName = '';

  cancelApplied = false;

  filterOptions: any = {};

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private dataStorageService: DataStorageService,
    private config: AppConfigService,
    private activatedRoute: ActivatedRoute,
    private auditService: AuditService
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
    this.auditService.audit(11, 'ADM-091', this.routeParts);
    this.cancelApplied = true;
    this.dialog.closeAll();
  }

  dismiss(): void {
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
        (filter: FilterModel) =>
          filter.columnName.toLowerCase() === values.filtername.toLowerCase()
      );
      if (filterOption.length === 0) {
        this.filterGroup.addControl(values.filtername, new FormControl(''));
        this.filterOptions[values.filtername] = [];
      } else {
        let value = '';
        if (filterOption[0].type === 'startsWith') {
          value = filterOption[0].value + '*';
        } else if (filterOption[0].type === 'contains') {
          value = '*' + filterOption[0].value;
        } else {
          value = filterOption[0].value;
        }
        this.filterGroup.addControl(values.filtername, new FormControl(value));
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
    console.log(this.filterGroup.controls);
    this.settingUpBetweenFilters(filterNames);
  }

  settingUpBetweenFilters(filterNames: any) {
    this.existingFilters.forEach((filters: FilterModel) => {
      if (filters.type === 'between') {
        const formFields = filterNames.filter(
          filterName => filterName.fieldName === filters.columnName
        );
        this.filterGroup.controls[formFields[0].filtername].setValue(
          filters.fromValue
        );
        this.filterGroup.controls[formFields[1].filtername].setValue(
          filters.toValue
        );
      }
    });
  }

  convertDate(dateString: string) {
    console.log(dateString);
    const date = new Date(dateString);
    let returnDate = date.getFullYear() + '-';
    returnDate +=
      Number(date.getMonth() + 1) < 10
        ? '0' + Number(date.getMonth() + 1)
        : Number(date.getMonth() + 1) < 10;
    returnDate += '-';
    returnDate +=
      Number(date.getDate()) < 10
        ? '0' + Number(date.getDate())
        : Number(date.getDate());
    return returnDate;
  }

  createBetweenFilter(filterDetails: any) {
    console.log(filterDetails);
    const existingFilter = this.existingFilters.filter(
      filters => filters.columnName === filterDetails.fieldName
    );
    if (existingFilter.length > 0) {
      const index = this.existingFilters.indexOf(existingFilter[0]);
      if (filterDetails.filtername.indexOf('From') >= 0) {
        if (filterDetails.datePicker === 'true') {
          this.momentDate = this.convertDate(
            this.filterGroup.controls[filterDetails.filtername].value
          );
          console.log(this.momentDate);
          this.existingFilters[index].fromValue = this.momentDate;
        } else {
          this.existingFilters[index].fromValue = this.filterGroup.controls[
            filterDetails.filtername
          ].value;
        }
      } else if (filterDetails.filtername.indexOf('To') >= 0) {
        if (filterDetails.datePicker === 'true') {
          this.momentDate = this.convertDate(
            this.filterGroup.controls[filterDetails.filtername].value
          );
          console.log(this.momentDate);
          this.existingFilters[index].toValue = this.momentDate;
        } else {
          this.existingFilters[index].toValue = this.filterGroup.controls[
            filterDetails.filtername
          ].value;
        }
      }
    } else {
      const filterModel = new FilterModel(filterDetails.fieldName, 'between');
      if (filterDetails.filterlabel.indexOf('From') >= 0) {
        if (filterDetails.datePicker === 'true') {
          this.momentDate = this.convertDate(
            this.filterGroup.controls[filterDetails.filtername].value
          );
          console.log(this.momentDate);
          filterModel.fromValue = this.momentDate;
        } else {
          filterModel.fromValue = this.filterGroup.controls[
            filterDetails.filtername
          ].value;
        }
      } else if (filterDetails.filterlabel.indexOf('To') >= 0) {
        if (filterDetails.datePicker === 'true') {
          this.momentDate = this.convertDate(
            this.filterGroup.controls[filterDetails.filtername].value
          );
          console.log(this.momentDate);
          filterModel.toValue = this.momentDate;
        } else {
          filterModel.toValue = this.filterGroup.controls[
            filterDetails.filtername
          ].value;
        }
      }
      this.existingFilters.push(filterModel);
    }
  }

  validateBetweenFilter(filterModel: FilterModel[], isDate: boolean[]) {
    console.log('validate called');
    console.log(filterModel);
    return new Promise((resolve, reject) => {
      filterModel.forEach(filter => {
        if (
          filter.fromValue === '' ||
          filter.fromValue === undefined ||
          filter.fromValue === null ||
          (filter.toValue === '' ||
            filter.toValue === undefined ||
            filter.toValue === null)
        ) {
          this.requiredError = true;
          this.fieldName = filter.columnName;
        } else {
          this.requiredError = false;
        }
        if (isDate[filterModel.indexOf(filter)]) {
          const fromDate = new Date(filter.fromValue);
          const toDate = new Date(filter.toValue);
          if (fromDate > toDate) {
            this.rangeError = true;
            this.fieldName = filter.columnName;
          } else {
            this.rangeError = false;
          }
        } else {
          if (filter.fromValue > filter.toValue) {
            this.rangeError = true;
            this.fieldName = filter.columnName;
          } else {
            this.rangeError = false;
          }
        }
      });
      resolve(true);
    });
  }

  async getFilterValuesOnSubmit() {
    this.existingFilters = [];
    Object.keys(this.filterGroup.controls).forEach(key => {
      const filter = this.FilterData.filter(data => data.filtername === key);
      let flag = false;
      console.log(filter);
      if (
        this.filterGroup.controls[key].value &&
        this.filterGroup.controls[key].value !== ''
      ) {
        let filterType = '';
        if (filter[0].filterType === 'between') {
          this.createBetweenFilter(filter[0]);
          flag = true;
        } else if (
          filter[0].dropdown === 'false' &&
          filter[0].autocomplete === 'false'
        ) {
          console.log(
            typeof this.filterGroup.controls[key].value,
            this.filterGroup.controls[key].value
          );
          if (
            this.filterGroup.controls[key].value.toString().endsWith('*') &&
            this.filterGroup.controls[key].value.toString().startsWith('*')
          ) {
            filterType = 'contains';
          } else if (
            this.filterGroup.controls[key].value.toString().endsWith('*')
          ) {
            filterType = 'startsWith';
          } else if (
            this.filterGroup.controls[key].value.toString().includes('*')
          ) {
            filterType = 'contains';
          } else {
            filterType = 'equals';
          }
        } else if (
          filter[0].dropdown === 'false' &&
          filter[0].autocomplete === 'true'
        ) {
          if (
            this.filterGroup.controls[key].value.toString().endsWith('*') &&
            this.filterGroup.controls[key].value.toString().startsWith('*')
          ) {
            filterType = 'contains';
          } else if (
            this.filterGroup.controls[key].value.toString().endsWith('*')
          ) {
            filterType = 'startsWith';
          } else if (
            this.filterGroup.controls[key].value.toString().includes('*')
          ) {
            filterType = 'contains';
          } else {
            filterType = 'equals';
          }
        } else if (
          filter[0].dropdown === 'true' &&
          filter[0].autocomplete === 'false'
        ) {
          filterType = 'equals';
        }
        if (!flag) {
          const filterObject = new FilterModel(
            key === 'Zone' && this.routeParts === 'centers'
              ? key.toLowerCase()
              : key,
            filterType,
            this.filterGroup.controls[key].value.toString().indexOf('*') === -1
              ? this.filterGroup.controls[key].value
              : this.filterGroup.controls[key].value.replace(/\*/g, '')
          );
          this.existingFilters.push(filterObject);
        }
      }
    });
    console.log(this.existingFilters);
    const betweenFilter = this.existingFilters.filter(
      (item: FilterModel) => item.type === 'between'
    );
    if (betweenFilter.length > 0) {
      const isDate = [];
      betweenFilter.forEach(f => {
        const temp = this.FilterData.filter(
          data => data.fieldName === f.columnName
        );
        if (temp[0]['datePicker'] === 'true') {
          isDate.push(true);
        } else {
          isDate.push(false);
        }
      });
      await this.validateBetweenFilter(betweenFilter, isDate);
    } else {
      this.requiredError = false;
      this.rangeError = false;
    }
    console.log(this.requiredError, this.filterGroup.valid, this.rangeError);
    if (
      !this.requiredError &&
      !this.rangeError &&
      this.filterGroup.valid &&
      !this.cancelApplied
    ) {
      this.auditService.audit(12, 'ADM-092', this.routeParts);
      const filters = Utils.convertFilter(
        this.activatedRoute.snapshot.queryParams,
        this.config.getConfig().primaryLangCode
      );
      filters.filters = this.existingFilters;
      const url = Utils.convertFilterToUrl(filters);
      this.dialog.closeAll();
      this.router.navigateByUrl(this.router.url.split('?')[0] + '?' + url);
    }
  }

  getControlName(filter: any, value: string) {
    console.log(filter);
    if (!(filter.dropdown === 'false' && filter.autocomplete === 'false')) {
      this.getFilterValues(
        filter.fieldName,
        filter.dropdown === 'true' ? undefined : value,
        filter.apiName,
        filter.filtername
      );
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
      value === undefined || value === null ? '' : value
    );
    this.filters = [this.filterModel];
    this.filtersRequest = new FilterRequest(
      this.filters,
      this.routeParts === 'blacklisted-words'
        ? 'all'
        : this.config.getConfig().primaryLangCode
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
}
