import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private sideMenuService: SideMenuService, private router: Router) {  }

  ngOnInit() {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  onItemSelected(singleItem) {
    if (this.screenResize < 840) {
      this.sideMenuService.closeNav();
      this.router.navigate([singleItem.route]);
    } else {
      this.router.navigate([singleItem.route]);
    }
  }
}
