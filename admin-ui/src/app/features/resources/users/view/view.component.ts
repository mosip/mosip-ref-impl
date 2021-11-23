import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuditService } from 'src/app/core/services/audit.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';

import { RequestModel } from 'src/app/core/models/request.model';
import { SortModel } from 'src/app/core/models/sort.model';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { PaginationModel } from 'src/app/core/models/pagination.model';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import Utils from 'src/app/app.utils';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  displayedColumns = [];
  actionButtons = [];
  actionEllipsis = [];
  paginatorOptions: any;
  sortFilter = [];
  primaryLang: string;  
  pagination = new PaginationModel();
  centerRequest = {} as CenterRequest;
  requestModel: RequestModel;
  users = [];
  subscribed: any;
  errorMessages: any;
  noData = false;
  filtersApplied = false;

  keycloakUrl =
    location.origin+'/keycloak/auth/admin/master/console/#/realms/mosip/users';

  constructor(
    private translate: TranslateService,
    private dataStorageService: DataStorageService,
    private appService: AppConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private headerService: HeaderService,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private auditService: AuditService
  ) {
    this.getUserConfigs();
    this.primaryLang = this.headerService.getUserPreferredLanguage();
    
    this.translateService.use(this.primaryLang);
    translateService.getTranslation(this.primaryLang).subscribe(response => {
      console.log(response);
      this.errorMessages = response.errorPopup;
    });
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        //this.getUsers();
      }
    });
  }

  ngOnInit() {
    //this.auditService.audit(3, 'ADM-042', 'users');
  }

  getUserConfigs() {
    let url = this.router.url.split('/')[3];
    if(url === "zoneuser"){
      this.dataStorageService
      .getSpecFileForMasterDataEntity("zoneuser")
      .subscribe(response => {
        this.displayedColumns = response.columnsToDisplay;
        this.actionButtons = response.actionButtons.filter(
          value => value.showIn.toLowerCase() === 'ellipsis'
        );
        this.actionEllipsis = response.actionButtons.filter(
          value => value.showIn.toLowerCase() === 'button'
        );
        this.paginatorOptions = response.paginator;
        this.auditService.audit(3, response.auditEventIds[0], 'zoneuser');
        this.getUsers();
      });
    }else{
      this.dataStorageService
      .getSpecFileForMasterDataEntity("user")
      .subscribe(response => {
        this.displayedColumns = response.columnsToDisplay;
        this.actionButtons = response.actionButtons.filter(
          value => value.showIn.toLowerCase() === 'ellipsis'
        );
        this.actionEllipsis = response.actionButtons.filter(
          value => value.showIn.toLowerCase() === 'button'
        );
        this.paginatorOptions = response.paginator;
        this.auditService.audit(3, response.auditEventIds[0], 'user');
        this.getUsers();
      });
    }    
  }

  pageEvent(event: any) {
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.primaryLang);
    filters.pagination.pageFetch = event.pageSize;
    filters.pagination.pageStart = event.pageIndex;
    const url = Utils.convertFilterToUrl(filters);
    let currenturl = this.router.url.split('/')[3];
    if(currenturl === "zoneuser"){
      this.router.navigateByUrl(`admin/resources/zoneuser/view?${url}`);
    }else{
      this.router.navigateByUrl(`admin/resources/users/view?${url}`);
    }
   
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
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.primaryLang);
    filters.sort = this.sortFilter;
    const url = Utils.convertFilterToUrl(filters);
    let currenturl = this.router.url.split('/')[3];
    if(currenturl === "zoneuser"){
      this.router.navigateByUrl(`admin/resources/zoneuser/view?${url}`);
    }else{
      this.router.navigateByUrl(`admin/resources/users/view?${url}`);
    }
  }

  getUsers() {
    this.users = [];
    this.noData = false;
    this.filtersApplied = false;
    const filters = Utils.convertFilter(this.activatedRoute.snapshot.queryParams, this.primaryLang);
    if (filters.filters.length > 0) {
      this.filtersApplied = true;
    }
    this.sortFilter = filters.sort;
    if(this.sortFilter.length == 0){
      this.sortFilter.push({"sortType":"desc","sortField":"createdDateTime"});      
    }
    let currenturl = this.router.url.split('/')[3];
    this.requestModel = new RequestModel(null, null, filters);
    console.log(JSON.stringify(this.requestModel));
    this.dataStorageService
      .getUsersData(this.requestModel, currenturl)
      .subscribe(({ response, errors }) => {
        console.log(response);
        if (response != null) {
          this.paginatorOptions.totalEntries = response.totalRecord;
          this.paginatorOptions.pageIndex = filters.pagination.pageStart;
          this.paginatorOptions.pageSize = filters.pagination.pageFetch;
          console.log(this.paginatorOptions);
          if (response.data != null) {
            this.users = [...response.data];
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

  ngOnDestroy() {
    this.subscribed.unsubscribe();
  }
}

