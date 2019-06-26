import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input() data: [];
  @Input() displayedColumns: [];
  tableData = [];
  constructor() { }
  columnsToDisplay: string[];
  ngOnInit() {
    this.tableData = [...this.data];
    this.columnsToDisplay = this.displayedColumns;
    console.log(...this.data);
    console.log(this.displayedColumns);
  }
  style(index) {
    if (index === 0) {
     return 'blue';
    }
  }
}
