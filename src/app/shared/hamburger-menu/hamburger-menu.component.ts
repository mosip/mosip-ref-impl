import { Component, OnInit, Input, ViewEncapsulation} from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-hamburger-menu',
  templateUrl: './hamburger-menu.component.html',
  styleUrls: ['./hamburger-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HamburgerComponent implements OnInit {

  @Input() data;

  profileList: any[];

  constructor(private location: Location) { }

  ngOnInit() {
    this.profileList = this.data.menuList;
  }

  onItem() {
    // this.location.back();
  }

}
