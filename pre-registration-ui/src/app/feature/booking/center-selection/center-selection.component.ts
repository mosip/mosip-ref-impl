import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialougComponent } from '../../../shared/dialoug/dialoug.component';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { RegistrationCentre } from './registration-center-details.model';
import { Router, ActivatedRoute } from '@angular/router';

import { UserModel } from 'src/app/shared/models/demographic-model/user.modal';
import { BookingService } from '../booking.service';
import { RegistrationService } from 'src/app/core/services/registration.service';
import { TranslateService } from '@ngx-translate/core';
import Utils from 'src/app/app.util';
import { ConfigService } from 'src/app/core/services/config.service';
import * as appConstants from './../../../app.constants';
import { BookingDeactivateGuardService } from 'src/app/shared/can-deactivate-guard/booking-guard/booking-deactivate-guard.service';
import LanguageFactory from 'src/assets/i18n';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-center-selection',
  templateUrl: './center-selection.component.html',
  styleUrls: ['./center-selection.component.css']
})
export class CenterSelectionComponent extends BookingDeactivateGuardService implements OnInit, OnDestroy {
  REGISTRATION_CENTRES: RegistrationCentre[] = [];
  searchClick: boolean = true;
  isWorkingDaysAvailable = false;
  canDeactivateFlag = true;
  locationTypes = [];

  locationType = null;
  searchText = null;
  showTable = false;
  selectedCentre = null;
  showMap = false;
  showMessage = false;
  enableNextButton = false;
  bookingDataList = [];
  errorlabels: any;
  step = 0;
  showDescription = false;
  mapProvider = 'OSM';
  searchTextFlag = false;
  displayMessage = 'Showing nearby registration centers';
  users: UserModel[];
  subscriptions: Subscription[] = [];
  primaryLang = localStorage.getItem('langCode');
  workingDays: string;

  constructor(
    public dialog: MatDialog,
    private service: BookingService,
    private dataService: DataStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private registrationService: RegistrationService,
    private translate: TranslateService,
    private configService: ConfigService
  ) {
    super(dialog);
    this.translate.use(this.primaryLang);
  }

  ngOnInit() {
    this.REGISTRATION_CENTRES = [];
    this.selectedCentre = null;
    const subs = this.dataService.getLocationTypeData().subscribe(response => {
      this.locationTypes = response[appConstants.RESPONSE]['locations'];
    });
    this.subscriptions.push(subs);
    this.users = this.service.getNameList();
    this.getRecommendedCenters();
    this.getErrorLabels();
  }

  getErrorLabels() {
    let factory = new LanguageFactory(this.primaryLang);
    let response = factory.getCurrentlanguage();
    this.errorlabels = response['error'];
  }

  getRecommendedCenters() {
    const pincodes = [];
    this.REGISTRATION_CENTRES = [];
    this.users.forEach(user => {
      pincodes.push(user['postalCode']);
    });
    const subs = this.dataService
      .recommendedCenters(
        this.primaryLang,
        this.configService.getConfigByKey(appConstants.CONFIG_KEYS.preregistration_recommended_centers_locCode),
        pincodes
      )
      .subscribe(response => {
        if (response[appConstants.RESPONSE]) this.displayResults(response['response']);
      });
    this.subscriptions.push(subs);
  }

  setSearchClick(flag: boolean) {
    this.searchClick = flag;
  }
  onSubmit() {
    this.searchTextFlag = true;
    if (this.searchText.length !== 0 || this.searchText !== null) {
      this.displayMessage = `Searching results for ${this.searchText} ....`;
    } else {
      this.displayMessage = '';
    }
  }
  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
    this.showDescription = true;
  }

  prevStep() {
    this.step--;
  }

  showResults() {
    this.REGISTRATION_CENTRES = [];
    if (this.locationType !== null && this.searchText !== null) {
      this.showMap = false;
      const subs = this.dataService
        .getRegistrationCentersByName(this.locationType.locationHierarchylevel, this.searchText)
        .subscribe(
          response => {
            if (response[appConstants.RESPONSE]) {
              this.displayResults(response[appConstants.RESPONSE]);
            } else {
              this.showMessage = true;
              this.selectedCentre = null;
            }
          },
          error => {
            this.showMessage = true;
            this.displayMessageError('Error', this.errorlabels.error, error);
          }
        );
      this.subscriptions.push(subs);
    }
  }

  plotOnMap() {
    this.showMap = true;
    this.service.changeCoordinates([Number(this.selectedCentre.longitude), Number(this.selectedCentre.latitude)]);
  }

  selectedRow(row) {
    this.selectedCentre = row;
    this.enableNextButton = true;

    if (Object.keys(this.selectedCentre).length !== 0) {
      this.plotOnMap();
    }
  }

  getLocation() {
    this.REGISTRATION_CENTRES = [];
    if (navigator.geolocation) {
      this.showMap = false;
      navigator.geolocation.getCurrentPosition(position => {
        const subs = this.dataService.getNearbyRegistrationCenters(position.coords).subscribe(
          response => {
            if (
              response[appConstants.NESTED_ERROR].length === 0 &&
              response[appConstants.RESPONSE]['registrationCenters'].length !== 0
            ) {
              this.displayResults(response[appConstants.RESPONSE]);
            } else {
              this.showMessage = true;
            }
          },
          error => {
            this.showMessage = true;
            this.displayMessageError('Error', this.errorlabels.error, error);
          }
        );
        this.subscriptions.push(subs);
      });
    } else {
    }
  }

  changeTimeFormat(time: string): string | Number {
    let inputTime = time.split(':');
    let formattedTime: any;
    if (Number(inputTime[0]) < 12) {
      formattedTime = inputTime[0];
      formattedTime += ':' + inputTime[1] + ' am';
    } else {
      formattedTime = Number(inputTime[0]) - 12;
      formattedTime += ':' + inputTime[1] + ' pm';
    }

    return formattedTime;
  }

  dispatchCenterCoordinatesList() {
    const coords = [];
    this.REGISTRATION_CENTRES.forEach(centre => {
      const data = {
        id: centre.id,
        latitude: Number(centre.latitude),
        longitude: Number(centre.longitude)
      };
      coords.push(data);
    });
    this.service.listOfCenters(coords);
  }

  routeNext() {
    this.registrationService.setRegCenterId(this.selectedCentre.id);
    this.users.forEach(user => {
      this.service.updateRegistrationCenterData(user.preRegId, this.selectedCentre);
    });
    this.canDeactivateFlag = false;
    this.router.navigate(['../pick-time'], { relativeTo: this.route });
  }

  routeDashboard() {
    this.canDeactivateFlag = false;
    const url = Utils.getURL(this.router.url, 'dashboard', 3);
    this.router.navigateByUrl(url);
  }

  routeBack() {
    let url = '';
    if (this.registrationService.getUsers().length === 0) {
      url = Utils.getURL(this.router.url, 'dashboard', 3);
    } else {
      url = Utils.getURL(this.router.url, 'summary/preview', 2);
    }
    this.canDeactivateFlag = false;
    this.router.navigateByUrl(url);
  }

  async displayResults(response: any) {
    this.REGISTRATION_CENTRES = response['registrationCenters'];
    await this.getWorkingDays();
    this.showTable = true;
    if (this.REGISTRATION_CENTRES) {
      this.selectedRow(this.REGISTRATION_CENTRES[0]);
      this.dispatchCenterCoordinatesList();
    }
  }

  getWorkingDays() {
    return new Promise(resolve => {
      this.REGISTRATION_CENTRES.forEach(center => {
        this.dataService.getWorkingDays(center.id, this.primaryLang).subscribe(response => {
          console.log(response);
          center.workingDays = '';
          response[appConstants.RESPONSE]['workingdays'].forEach(day => {
            if (day.working === true || ((day.working === null || day.working === undefined) && day.globalWorking === true)) {
              console.log(day.name);
              center.workingDays = center.workingDays + day.name + ', ';
              console.log(center.workingDays);
            }
          });
          this.isWorkingDaysAvailable = true;
          resolve(true);
        });
      });
    });
  }

  displayMessageError(title: string, message: string, error: any) {
    if (
      error &&
      error[appConstants.ERROR] &&
      error[appConstants.ERROR][appConstants.NESTED_ERROR][0].errorCode === appConstants.ERROR_CODES.tokenExpired
    ) {
      message = this.errorlabels.tokenExpiredLogout;
      title = '';
    }
    const messageObj = {
      case: 'MESSAGE',
      title: title,
      message: message
    };
    this.openDialog(messageObj, '250px');
  }
  openDialog(data, width) {
    const dialogRef = this.dialog.open(DialougComponent, {
      width: width,
      data: data
    });
    return dialogRef;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
