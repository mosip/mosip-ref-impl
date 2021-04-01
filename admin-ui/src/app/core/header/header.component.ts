import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

import { SideMenuService } from '../services/side-menu.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';
import { HeaderService } from '../services/header.service';
import { DataStorageService } from '../services/data-storage.service';
import { version } from 'package.json';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {
  @Input() screenResize: number;

  profile = {
    type: 'profile',
    name: 'Joan Doe',
    zone: 'Zonal Admin',
    profileImg: './assets/images/profile.png',
    menuList: [
      {
        displayName: {
          eng: 'Logout',
          ara: 'تسجيل خروج',
          fra: 'Se déconnecter'
        },
        route: null
      }
    ]
  };

  zone: string;
  appVersion : "";
  constructor(
    public sideMenuService: SideMenuService,
    private translateService: TranslateService,
    private appConfigService: AppConfigService,
    private headerService: HeaderService,
    private dataService: DataStorageService
  ) {
    // tslint:disable-next-line:no-string-literal
    translateService.use(appConfigService.getConfig()['primaryLangCode']);
    this.appVersion = appConfigService.getConfig()['version'];
  }

  ngOnInit() {
    console.log(this.appVersion);
    console.log('SreenWidth', this.screenResize);
    if (this.headerService.getUsername() !== '') {
      this.dataService
      .getLoggedInUserZone(
        this.headerService.getUsername(),
        this.appConfigService.getConfig()['primaryLangCode']
      )
      .subscribe(response => {
        if (response.response) {
          console.log(response.response.zoneName);
          this.zone = response.response.zoneName;
        }
      });
    }
  }
}
