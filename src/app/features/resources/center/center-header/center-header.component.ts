import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-center-header',
  templateUrl: './center-header.component.html',
  styleUrls: ['./center-header.component.scss']
})
export class CenterHeaderComponent implements OnInit {

  @Output() navigate = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  naviagtionBack() {
    this.navigate.emit();
  }
}
