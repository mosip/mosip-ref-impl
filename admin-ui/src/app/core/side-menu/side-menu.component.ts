import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { SideMenuService } from '../services/side-menu.service';
import { NavItem } from '../../core/nav-item';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SideMenuComponent implements OnInit {

  @Input() item: NavItem;
  @Input() index: number;
  @Input() depth: number;
  @Input() screenResize: number;
  @Output() closeNav = new EventEmitter<any>();
  locationUrl: any;

  constructor(private sideMenuService: SideMenuService, private router: Router, private location: Location) {
    router.events.subscribe(() => {
      this.locationUrl = location.path();
    //  console.log('location', this.locationUrl);
    });
  }

  ngOnInit() {
  //  console.log('afsgfasgfdgsa', this.item);
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  onItemSelected(item) {
    console.log('item', item);
    if (this.screenResize < 840) {
      this.sideMenuService.closeNav();
      this.router.navigate([item.route]);
    } else {
      this.router.navigate([item.route]);
    }
  }
}
