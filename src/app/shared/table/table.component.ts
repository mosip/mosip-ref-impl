import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';
import { SortModel } from 'src/app/core/models/sort.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges {
  @Input() data: [];
  @Input() displayedColumns: [];
  @Input() buttonList: [];
  @Output() sort = new EventEmitter();
  tableData = [];
  columnsOfTableData = [];
  sortStatusArray: string[];
  constructor(private router: Router) {}
  ngOnInit() {
    this.tableData = [...this.data];
    console.log(this.tableData);
    console.log(this.displayedColumns);
    this.sortStatusArray = [];
  }

  ngOnChanges(): void {
    this.tableData = [...this.data];
    this.columnsOfTableData = [];
    this.displayedColumns.forEach(column => {
      // tslint:disable-next-line:no-string-literal
      this.columnsOfTableData.push(column['name']);
    });
  }

  selectedRow(data, index) {
    console.log(data + index);
    this.router.navigate(['404']);
  }
  getTableRowData(data, index) {
    console.log(data.id + 'index' + index);
    if (index === 0) {
      this.router.navigate(['admin/resources/centers/single-view', data.id]);
    }
  }
  sortColumn(columnName) {
    const sortModel = new SortModel();
    sortModel.sortField = columnName;
    if (this.sortStatusArray.length === 0) {
      this.sortStatusArray.push(columnName);
      sortModel.sortType = 'asc';
    } else if (this.sortStatusArray.indexOf(columnName) >= 0) {
      const valueIndex = this.sortStatusArray.indexOf(columnName);
      this.sortStatusArray.splice(valueIndex, 1);
      sortModel.sortType = 'desc';
    } else if (this.sortStatusArray.indexOf(columnName) === -1) {
      this.sortStatusArray.push(columnName);
      sortModel.sortType = 'asc';
    }
    console.log(sortModel);
    this.sort.emit(sortModel);
  }

  tableStyle(index) {
    const myTableStyles = {
      color: '',
      cursor: ''
    };
    if (index === 0) {
      myTableStyles.color = 'rgb(24, 181, 209)';
      myTableStyles.cursor = 'pointer';
      return myTableStyles;
    }
  }
}
