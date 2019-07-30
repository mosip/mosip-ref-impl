import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  ViewEncapsulation
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SortModel } from 'src/app/core/models/sort.model';
import { AppConfigService } from 'src/app/app-config.service';
import * as appConstants from 'src/app/app.constants';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges {
  @Input() data: [];
  @Input() displayedColumns: [];
  @Input() buttonList: [];
  @Input() sortData: SortModel[];
  @Output() sort = new EventEmitter();
  tableData = [];
  columnsOfTableData = [];
  sortStatusArray: string[] = [];
  currentRoute: string;
  lang: string;
  sortTrackIndex: number;
  sortIconTrackerArray = new Array(15).fill(0);
  ellipsisList = [];
  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private appConfig: AppConfigService
  ) {}
  ngOnInit(): void {
    this.tableData = [...this.data];
    console.log(this.tableData);
    console.log(this.displayedColumns);
    this.sortStatusArray = [];
    this.lang = this.appConfig.getConfig().primaryLangCode;
  }

  ngOnChanges(): void {
    this.tableData = [...this.data];
    this.columnsOfTableData = [];
    this.displayedColumns.forEach(column => {
      // tslint:disable-next-line:no-string-literal
      this.columnsOfTableData.push(column['name']);
    });
    this.setSortDirection();
  }

  setSortDirection() {
    if (this.sortData) {
      this.sortData.forEach((data: SortModel) => {
        if (this.sortStatusArray.indexOf(data.sortField) === -1) {
          this.sortStatusArray.push(data.sortField);
        }
        const index = this.columnsOfTableData.indexOf(data.sortField);
        if (data.sortType.toLowerCase() === 'asc') {
          this.sortIconTrackerArray[index] = 1;
        } else if (data.sortType.toLowerCase() === 'desc') {
          this.sortIconTrackerArray[index] = -1;
        }
      });
    }
  }

  selectedRow(data: any, index: number) {
    console.log(data + index);
    this.router.navigate(['404']);
  }
  getTableRowData(data: any, index: number, columnName: string) {
    const routeIndex = this.router.url.lastIndexOf('/');
    this.currentRoute = this.router.url.slice(0, routeIndex);
    const currentRouteType = this.router.url.split('/')[3];
    const id = appConstants.ListViewIdKeyMapping[`${currentRouteType}`];
    console.log(id);
    console.log(this.currentRoute);
    if (index === 0) {
      // tslint:disable-next-line:no-string-literal
      this.router.navigate([
        `${this.currentRoute}/single-view`,
        data[id.idKey]
      ]);
    }
  }
  sortColumn(columnName: string, columnIndex: number) {
    console.log(this.sortIconTrackerArray);
    const sortObject = this.sortData.filter(data => data.sortField === columnName);
    let sortModel = new SortModel();
    if (sortObject.length === 0) {
      sortModel.sortField = columnName;
      sortModel.sortType = 'asc';
      this.sortIconTrackerArray[columnIndex] = 1;
    } else {
      sortModel = sortObject[0];
      if (sortModel.sortType.toLowerCase() === 'asc') {
        sortModel.sortType = 'desc';
        this.sortIconTrackerArray[columnIndex] = -1;
      } else if (sortModel.sortType.toLowerCase() === 'desc') {
        sortModel.sortType = null;
        this.sortIconTrackerArray[columnIndex] = 0;
      }
    }
    console.log(this.sortStatusArray);
    console.log(sortModel);
    this.sort.emit(sortModel);
  }

  ellipsisAction(data) {
    this.ellipsisList = this.buttonList;
    if (data.isActive === true) {
     this.ellipsisList.filter(values => {
      if (values.buttonName.eng === 'Activate') {
        const index = this.ellipsisList.indexOf(values);
        this.ellipsisList.splice(index, 1);
      }
     });
   } else if (data.isActive === false) {
    this.ellipsisList.filter(values => {
      if (values.buttonName.eng === 'Deactivate') {
        const index = this.ellipsisList.indexOf(values);
        this.ellipsisList.splice(index, 1);
      }
    });
  }
}

  tableStyle(index, columnValue, columnName) {
    const myTableStyles = {
      color: '#0F2126',
      cursor: '',
      border: '',
      padding: '',
      borderRadius: '',
      backgroundColor: '',
      whiteSpace: 'nowrap',
      textTransform: ''
    };
    if (index === 0) {
      myTableStyles.color = '#0F2126';
      myTableStyles.cursor = 'pointer';
      return myTableStyles;
    }
    if (columnValue === true && columnName === 'isActive') {
      myTableStyles.backgroundColor = '#C2F2DA';
      myTableStyles.padding = '5px';
      myTableStyles.border = '1px solid #4AD991';
      myTableStyles.borderRadius = '7px';
      myTableStyles.textTransform = 'uppercase';
      return myTableStyles;
    } else if (columnValue === false && columnName === 'isActive') {
      myTableStyles.backgroundColor = '#CECFD0';
      myTableStyles.padding = '5px';
      myTableStyles.border = '1px solid #9C9F9F';
      myTableStyles.borderRadius = '7px';
      myTableStyles.textTransform = 'uppercase';
      return myTableStyles;
    }
  }
}
