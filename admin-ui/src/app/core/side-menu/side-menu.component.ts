import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { SideMenuService } from '../services/side-menu.service';
import { NavItem } from '../../core/nav-item';
import { AuditService } from '../services/audit.service';
import { RolesService } from '../services/roles.service';

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
  isCollapsed: boolean = true;

  constructor(
    private sideMenuService: SideMenuService,
    private router: Router,
    private location: Location,
    private auditService: AuditService,
    public rolesService: RolesService
  ) {
    router.events.subscribe(() => {
      this.locationUrl = location.path();
    });
  }

  ngOnInit() {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  toggleCollapse() {
    if(this.isCollapsed){
      this.isCollapsed = false;
    }else{
      this.isCollapsed = true;
    }
  }

  onItemSelected(item: any) {
    const itemName = item.route.split('/')[item.route.split('/').length - 1];
    this.auditService.audit(1, item.auditEventId, itemName);
    if (this.screenResize < 840) {
      this.sideMenuService.closeNav();
      this.router.navigate([item.route]);
    } else {
      this.router.navigate([item.route]);
    }
  }
}
