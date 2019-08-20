import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { HeaderModel } from 'src/app/core/models/header.model';
import { DataStorageService } from 'src/app/core/services/data-storage.service';

@Component({
  selector: 'app-center-header',
  templateUrl: './center-header.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CenterHeaderComponent implements OnInit {
  actionButtonElipses = new Array();

  @Input() headerData: HeaderModel;


  elipses = {
    type: 'elipses',
    menuList: this.actionButtonElipses
  };

  constructor(private dataSerice: DataStorageService) { }

  ngOnInit() {
    this.dataSerice.getCenterSpecificLabelsAndActions().subscribe(data => {
      if (data && data.actionButtons) {
        for (const list of data.actionButtons) {
          this.actionButtonElipses.push(list);
        }
      }
    });
  }
}
