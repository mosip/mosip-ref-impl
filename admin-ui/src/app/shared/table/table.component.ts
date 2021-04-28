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
import { AppConfigService } from 'src/app/app-config.service';
import * as appConstants from 'src/app/app.constants';
import { CommonService } from 'src/app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { AuditService } from 'src/app/core/services/audit.service';
import { HeaderService } from 'src/app/core/services/header.service';

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
  @Input() noDataFlag: boolean;
  @Input() showRadioButton: boolean = false;
  @Output() sort = new EventEmitter();
  @Output() selectedCenterDetail = new EventEmitter();
  
  tableData = [];
  columnsOfTableData = [];
  sortStatusArray: string[] = [];
  currentRoute: string;
  lang: string;
  sortTrackIndex: number;
  sortIconTrackerArray = new Array(15).fill(0);
  ellipsisList = [];
  imageSource: string;

  constructor(
    private router: Router,
    private appConfig: AppConfigService,
    private commonService: CommonService,
    private translate: TranslateService,
    private headerService: HeaderService,
    private auditService: AuditService
  ) {
    let lang = headerService.getUserPreferredLanguage();
   translate.use(lang);
  }
  ngOnInit(): void {
    this.tableData = [...this.data];
    console.log(this.tableData);
    console.log(this.displayedColumns);
    this.sortStatusArray = [];
    this.lang = this.headerService.getUserPreferredLanguage();
    const route = this.router.url.split('/')[3];
    this.imageSource = appConstants.ListViewIdKeyMapping[`${route}`]['imagePath'];
    console.log(this.imageSource);
  }

  ngOnChanges(): void {
    this.tableData = [...this.data];
    this.columnsOfTableData = [];
    this.displayedColumns.forEach(column => {
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

  selectedRow(data: any, specData: any) {
    const currentRouteType = this.router.url.split('/')[3];
    const id = appConstants.ListViewIdKeyMapping[`${currentRouteType}`];
    if (specData.callBackFunction && specData.callBackFunction !== '') {
      console.log("selectedRow id.idKey>>>"+id.idKey);
      console.log("data>>>"+JSON.stringify(data));
      this.commonService[specData.callBackFunction]({...data}, specData.redirectURL, id.idKey);
    }
  }

  selectedCenter(data: any) {
    this.selectedCenterDetail.emit(data);
  }

  getTableRowData(data: any, index: number, columnName: string) {
    const routeIndex = this.router.url.lastIndexOf('/');
    this.currentRoute = this.router.url.slice(0, routeIndex);
    const currentRouteType = this.router.url.split('/')[3];
    const id = appConstants.ListViewIdKeyMapping[`${currentRouteType}`];
    this.auditService.audit(7, id.auditEventId, currentRouteType);
    console.log(id);
    console.log(this.currentRoute);
    if (index === 0) {
      if (currentRouteType.toLowerCase() === 'blacklisted-words') {
        this.router.navigate([
          `${this.currentRoute}/single-view`,
          data[id.idKey] + '$' + data.langCode
        ]);
      } else {
        this.router.navigate([
          `${this.currentRoute}/single-view`,
          data[id.idKey]
        ]);
      }
    }
  }

  sortColumn(columnName: string, columnIndex: number) {
    this.auditService.audit(13, 'ADM-093', {
      masterdataName: this.router.url.split('/')[3],
      columnName
    });
    console.log(this.sortIconTrackerArray);
    const sortObject = this.sortData.filter(
      data => data.sortField === columnName
    );
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
    if (data.isActive === true) {
      this.ellipsisList = [...this.buttonList];
      this.ellipsisList.filter(values => {
        if (values.buttonName.eng === 'Activate') {
          const index = this.ellipsisList.indexOf(values);
          this.ellipsisList.splice(index, 1);
        }
      });
    } else if (data.isActive === false) {
      this.ellipsisList = [...this.buttonList];
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
      textTransform: '',
      fontSize: ''
    };
    if (index === 0) {
      myTableStyles.color = '#0F2126';
      myTableStyles.cursor = 'pointer';
      return myTableStyles;
    }
    if (columnValue === true && columnName === 'isActive') {
      myTableStyles.color = 'white';
      myTableStyles.fontSize = '7.5px';
      myTableStyles.backgroundColor = '#4AD991';
      myTableStyles.padding = '4px 4px 4px 4px';
      myTableStyles.border = '0.8px solid #68DA7E';
      myTableStyles.borderRadius = '15px';
      myTableStyles.textTransform = 'uppercase';
      return myTableStyles;
    } else if (columnValue === false && columnName === 'isActive') {
      myTableStyles.color = 'white';
      myTableStyles.backgroundColor = '#9C9F9F';
      myTableStyles.fontSize = '7.5px';
      myTableStyles.padding = '4px 4px 4px 4px';
      myTableStyles.border = '0.8px solid #9C9F9F';
      myTableStyles.borderRadius = '20px';
      myTableStyles.textTransform = 'uppercase';
      return myTableStyles;
    }
  }
}
