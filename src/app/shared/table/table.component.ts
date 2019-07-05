import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges {
  @Input() data: [];
  @Input() displayedColumns: [];
  @Input() buttonList: [];
  progressValue = 30;
  tableData = [];
  columnsOfTableData = [];
  constructor(private router: Router) {}
  ngOnInit() {
    this.tableData = [...this.data];
    console.log(this.tableData);
    console.log(this.displayedColumns);
  }

  ngOnChanges(): void {
    if (this.data.length > 0) {
      this.progressValue = 100;
    }
    this.tableData = [...this.data];
    this.columnsOfTableData = [];
    this.displayedColumns.forEach(column => {
      // tslint:disable-next-line:no-string-literal
      this.columnsOfTableData.push(column['name']);
    });
  }

  selectedRow(data, index) {
    console.log(data + index);
    //   this.tableData.splice(index, 1);
    this.router.navigate(['404']);
  }
  getTableRowData(data, index) {
    console.log(data.id + 'index' + index);
    if (index === 0) {
      this.router.navigate(['admin/resources/centers/single-view', data.id]);
    }
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
