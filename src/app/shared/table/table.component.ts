import {
  Component,
  OnInit,
  Input,
  OnChanges
} from '@angular/core';
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
  tableData = [];
  columnsOfTableData = [];
  constructor(private router:Router) {}
  ngOnInit() {
    this.tableData = [...this.data];
    console.log(this.tableData);
    console.log(this.displayedColumns);
  }

  ngOnChanges(): void {
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

  tableStyle(index) {
    if (index === 0) {
    return 'rgb(24, 181, 209)';
  }
}

}
