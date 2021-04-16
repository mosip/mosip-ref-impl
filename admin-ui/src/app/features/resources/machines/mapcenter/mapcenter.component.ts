import { Component, ViewEncapsulation} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import Utils from '../../../../app.utils';
import { AppConfigService } from 'src/app/app-config.service';
import { CenterService } from 'src/app/core/services/center.service';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { AuditService } from 'src/app/core/services/audit.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { RequestModel } from 'src/app/core/models/request.model';
import * as centerConfig from 'src/assets/entity-spec/center.json';
import { SortModel } from 'src/app/core/models/sort.model';
import { DeviceRequest } from 'src/app/core/models/deviceRequest.model';
import { FilterModel } from 'src/app/core/models/filter.model';
import * as appConstants from '../../../../app.constants';
import { MachineService } from 'src/app/core/services/machines.service';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'map-center-device',
  templateUrl: './mapcenter.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MapcenterComponent {
  displayedColumns = [];
  actionButtons = [];
  actionEllipsis = [];
  paginatorOptions: any;
  sortFilter = [];
  pagination = new PaginationModel();
  centerRequest = {} as CenterRequest;
  requestModel: RequestModel;
  centers = [];
  subscribed: any;
  errorMessages: any;
  noData = false;
  filtersApplied = false;
  DeviceRequest = {} as DeviceRequest;
  selectedCenterDetails: any;
  machineInfo: any;

  constructor(
    private location: Location,
    private router: Router,
    private centerService: CenterService,
    private appService: AppConfigService,
    private headerService: HeaderService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private machineService: MachineService,
    private dataStorageService: DataStorageService,
  ) {
    this.subscribed = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });
  }

  initializeComponent() {
    this.activatedRoute.params.subscribe(params => {
      this.getData(params);
    });
    this.displayedColumns = centerConfig.columnsToDisplay;
    this.paginatorOptions = centerConfig.paginator;
  }

  pageEvent(event: any) {
    const filters = Utils.convertFilter(
      this.activatedRoute.snapshot.queryParams,
      this.headerService.getUserPreferredLanguage()
      );
    filters.pagination.pageFetch = event.pageSize;
    filters.pagination.pageStart = event.pageIndex;
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl(`admin/resources/centers/view?${url}`);
  }

  getSortColumn(event: SortModel) {
    console.log(event);
    this.sortFilter.forEach(element => {
      if (element.sortField === event.sortField) {
        const index = this.sortFilter.indexOf(element);
        this.sortFilter.splice(index, 1);
      }
    });
    if (event.sortType != null) {
      this.sortFilter.push(event);
    }
    const filters = Utils.convertFilter(
      this.activatedRoute.snapshot.queryParams,
      this.headerService.getUserPreferredLanguage()
    );
    filters.sort = this.sortFilter;
    const url = Utils.convertFilterToUrl(filters);
    this.router.navigateByUrl('admin/resources/devices/map-center/3000022?' + url);
  }

  selectedCenterDetail(data: any) {
    this.selectedCenterDetails = data;
  }

  getCenterDetails(zone: any) {
    this.centers = [];
    this.noData = false;
    this.filtersApplied = false;
    const filters = Utils.convertFilter(
      this.activatedRoute.snapshot.queryParams,
      this.headerService.getUserPreferredLanguage()
    );
    if (filters.filters.length > 0) {
      this.filtersApplied = true;
    }
    // filters.filters = [{"columnName":"zone","type":"equals","value":"Mnasra"}];
    this.sortFilter = filters.sort;
    this.requestModel = new RequestModel(null, null, filters);
    console.log(JSON.stringify(this.requestModel));
    this.centerService
      .getRegistrationCentersDetails(this.requestModel)
      .subscribe(({ response, errors }) => {
        console.log(response);
        if (response != null) {
          this.paginatorOptions.totalEntries = response.totalRecord;
          this.paginatorOptions.pageIndex = filters.pagination.pageStart;
          this.paginatorOptions.pageSize = filters.pagination.pageFetch;
          console.log(this.paginatorOptions);
          if (response.data !== null) {
            this.centers = response.data ? [...response.data] : [];
          } else {
            this.noData = true;
          }
        } else {
          this.dialog
            .open(DialogComponent, {
               data: {
                case: 'MESSAGE',
                title: this.errorMessages.technicalError.title,
                message: this.errorMessages.technicalError.message,
                btnTxt: this.errorMessages.technicalError.btnTxt
               } ,
              width: '700px'
            })
            .afterClosed()
            .subscribe(result => {
              console.log('dialog is closed from view component');
            });
        }
      });
  }

  submit() {
    let data = {};
    data = {
      case: 'CONFIRMATION',
      title: 'Confirm Assigning',
      message: 'Do you want to assign the selected machine to ' + this.selectedCenterDetails.name + ' center',
      yesBtnTxt: 'CONFIRM',
      noBtnTxt: 'CANCEL'
    };
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px',
      data
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.saveData();
      }
    });
  }

  saveData() {
    delete this.machineInfo.createdBy;
    delete this.machineInfo.createdDateTime;
    delete this.machineInfo.updatedBy;
    delete this.machineInfo.updatedDateTime;
    delete this.machineInfo.deletedDateTime;
    delete this.machineInfo.isDeleted;
    delete this.machineInfo.zone;
    delete this.machineInfo.machineTypeName;
    delete this.machineInfo.mapStatus;

    this.machineInfo.regCenterId = this.selectedCenterDetails.id;
    const request = new RequestModel(
      appConstants.registrationDeviceCreateId,
      null,
      this.machineInfo
    );
    this.dataStorageService
      .updateData(request).subscribe(
      response => {
       this.showMessage(response);
      }
    );
  }

  showMessage(response) {
    let data = {};
    const self = this;
    if (response.errors) {
      data = {
        case: 'MESSAGE',
        title: 'Failure !',
        message: response.errors[0].message,
        btnTxt: 'DONE'
      };
    } else {
      data = {
        case: 'MESSAGE',
        title: 'Success',
        // tslint:disable-next-line:max-line-length
        message: 'Success! You have assigned Machine ' + this.machineInfo.name + ' to Registration Center ' + this.selectedCenterDetails.name + ' successfully',
        btnTxt: 'DONE'
      };
    }

    const dialogRef = self.dialog.open(DialogComponent, {
      width: '550px',
      data
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response.errors) {
      } else {
        self.location.back();
      }
    });
  }

  cancel() {
    this.location.back();
  }

  async getData(params: any) {
    const filter = new FilterModel('id', 'equals', params.id);
    this.DeviceRequest.filters = [filter];
    this.DeviceRequest.languageCode = 'eng';
    this.DeviceRequest.sort = [];
    this.DeviceRequest.pagination = { pageStart: 0, pageFetch: 10 };
    const request = new RequestModel(
      appConstants.registrationDeviceCreateId,
      null,
      this.DeviceRequest
    );
    this.machineService.getRegistrationMachinesDetails(request).subscribe(
      response => {
        if (response.response.data) {
          this.machineInfo = response.response.data[0];
          this.getCenterDetails(response.response.data[0].zoneCode);
        }
      }
    );
  }
}
