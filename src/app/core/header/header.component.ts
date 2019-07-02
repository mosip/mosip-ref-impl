import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

import { SideMenuService } from '../services/side-menu.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  @Input() screenResize;

  profile = {
    name: 'Joan Doe',
    zone: 'Zonal Admin',
    menuList: [
      {
        displayName: 'Logout',
        route: null
      }
    ]
  };

  constructor(public sideMenuService: SideMenuService, private translateService: TranslateService) {
    translateService.use('eng');
  }

  ngOnInit() {
  }
}
