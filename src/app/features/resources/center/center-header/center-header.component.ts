import { Component, OnInit, Input } from '@angular/core';
import { HeaderModel } from 'src/app/core/models/header.model';
import { DataStorageService } from 'src/app/core/services/data-storage.service';

@Component({
  selector: 'app-center-header',
  templateUrl: './center-header.component.html',
  styleUrls: ['./center-header.component.scss']
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
      if (data && data.eng && data.eng.actionButtons) {
        for (const list of data.eng.actionButtons) {
          this.actionButtonElipses.push(list);
        }
      }
    });
  }
}
