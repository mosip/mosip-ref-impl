import { HeaderService } from 'src/app/core/services/header.service';
import { LogoutService } from './../../core/services/logout.service';
import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-hamburger-menu',
  templateUrl: './hamburger-menu.component.html',
  styleUrls: ['./hamburger-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HamburgerComponent implements OnInit {

  @Input() data: any;
  roleName: string;
  roleNameSubstr: string;
  userName: string;

  dataList: any[];

  constructor(private headerService: HeaderService, private logoutService: LogoutService) { }

  ngOnInit() {
    if (this.data && this.data.menuList) {
      this.dataList = this.data.menuList;
    }
    if (this.headerService.getUsername()) {
      this.userName = this.headerService.getUsername();
    }
    if (this.headerService.getRoles()) {
      this.roleNameSubstr = this.headerService.getRoles();
      const roleNameSplit = this.headerService.getRoles().indexOf(',');
      this.roleName = this.headerService.getRoles().substring(0, roleNameSplit);
    }
  }

  onItem() {
    this.logoutService.logout();
  }

}
