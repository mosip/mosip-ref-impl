import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

import { SideMenuService } from '../services/side-menu.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';

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
        displayName: 'Logout',
        route: null
      }
    ]
  };

  constructor(public sideMenuService: SideMenuService,
              private translateService: TranslateService,
              private appConfigService: AppConfigService) {
    // tslint:disable-next-line:no-string-literal
    translateService.use(appConfigService.getConfig()['primaryLangCode']);
  }

  ngOnInit() {
    console.log('SreenWidth', this.screenResize);
  }
}
