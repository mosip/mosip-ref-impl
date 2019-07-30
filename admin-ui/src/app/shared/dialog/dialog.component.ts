import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import * as appConstants from '../../app.constants';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { FormGroup, FormControl } from '@angular/forms';
import { RequestModel } from 'src/app/core/models/request.model';
import { FilterRequest } from 'src/app/core/models/filter-request.model';
import { FilterValuesModel } from 'src/app/core/models/filter-values.model';

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
  filtersRequest: FilterRequest;
  filterModel: FilterValuesModel;
  requestModel: RequestModel;
  options = [];
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private dataStorageService: DataStorageService
  ) {}

  async ngOnInit() {
    this.input = this.data;
    console.log(this.input);
    await this.getFilterMappings();
  }

  onNoClick(): void {
    this.dialogRef.close();
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
    filterNames.forEach(values => {
      this.filterGroup.addControl(values.filtername, new FormControl(''));
    });
  }
  getFilterValuesOnSubmit() {
    console.log(this.filterGroup);
  }

  getControlName(controlName) {
    this.getIntialFilterValues(controlName, '');
    this.filterGroup.get(`${controlName}`).valueChanges.subscribe(value => {
    });
  }

  getIntialFilterValues(columnName: string, value: string) {
    this.options = [];
    this.filters = [];
    const type = appConstants.FilterMapping[`${this.routeParts}`].apiName;
    this.filterModel = new FilterValuesModel(
      columnName,
      'unique',
      value === undefined ? value : ''
    );
    this.filters = [this.filterModel];
    this.filtersRequest = new FilterRequest(this.filters, 'eng');
    this.requestModel = new RequestModel('', null, this.filtersRequest);
    console.log(this.requestModel);
    this.dataStorageService
      .getFiltersForAllMaterDataTypes(type, this.requestModel)
      .subscribe(response => {
        console.log(response);
        this.options = [...response.response.filters];
        console.log(this.options);
      });
  }
  displayFn(subject) {
    return subject ? subject.fieldValue : undefined;
  }
}
