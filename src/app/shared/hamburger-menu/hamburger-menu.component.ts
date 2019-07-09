import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-hamburger-menu',
  templateUrl: './hamburger-menu.component.html',
  styleUrls: ['./hamburger-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HamburgerComponent implements OnInit {

  @Input() data: any;

  profileList: any[];

  constructor(private location: Location) { }

  ngOnInit() {
    console.log('hfdasfdsf', this.data);
    this.profileList = this.data.menuList;
  }

  onItem() {
    // this.location.back();
  }

}
