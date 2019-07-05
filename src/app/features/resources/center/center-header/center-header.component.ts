import { Component, OnInit, Input} from '@angular/core';
import { CenterHeaderModel } from 'src/app/core/models/center-header.model';

@Component({
  selector: 'app-center-header',
  templateUrl: './center-header.component.html',
  styleUrls: ['./center-header.component.scss']
})
export class CenterHeaderComponent implements OnInit {

  @Input() data: CenterHeaderModel;

  constructor() { }

  ngOnInit() {
  }
}
