import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, AfterViewInit } from '@angular/core';

import { SideMenuService } from '../services/side-menu.service';
import { TranslateService } from '@ngx-translate/core';
import { NavItem } from '../../core/nav-item';
import * as cloneObject from 'lodash/cloneDeep';
import * as appConstants from '../../app.constants';



@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ParentComponent implements OnInit, AfterViewInit {

  screenWidth: number;

  @ViewChild('appDrawer', { static: true }) appDrawer: ElementRef;

  languageData: any;
  navItems: NavItem[];

  constructor(private sideMenuService: SideMenuService, private translateService: TranslateService) {
    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      return this.screenWidth = window.innerWidth;
    };
  }

  ngOnInit() {
    this.translateService.use('eng');
    this.navItems = cloneObject(appConstants.navItems);
  }

  ngAfterViewInit() {
    this.sideMenuService.appDrawer = this.appDrawer;
  }
}
