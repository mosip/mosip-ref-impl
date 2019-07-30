import { Component, OnInit, Input } from '@angular/core';
import { HeaderModel } from 'src/app/core/models/header.model';

@Component({
  selector: 'app-mater-data-common-header',
  templateUrl: './mater-data-common-header.component.html'
})
export class MaterDataCommonHeaderComponent implements OnInit {

  @Input() masterDataName: string;
  @Input() headerData: HeaderModel;

  constructor() { }

  ngOnInit() {
  }

}
