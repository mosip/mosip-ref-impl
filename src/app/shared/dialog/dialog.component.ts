import { Component, OnInit, ViewEncapsulation, Input} from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogComponent implements OnInit {

  @Input() data;

  constructor() { }

  ngOnInit() { }

}
