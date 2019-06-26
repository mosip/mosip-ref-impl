import { Component, OnInit } from '@angular/core';
import { SideMenuService } from 'src/app/core/services/side-menu.service';
import { MatPaginatorIntl } from '@angular/material';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent extends MatPaginatorIntl implements OnInit  {

  route: string;
  constructor(private sideMenuService: SideMenuService) {
    super();
    this.itemsPerPageLabel = 'Show rows';
  }

  ngOnInit() {
     this.sideMenuService.currentUrl.subscribe((data) => {
      console.log('Subscriber :', data.split('/')[3]);
      this.route = data.split('/')[3];
  });
  }
}
