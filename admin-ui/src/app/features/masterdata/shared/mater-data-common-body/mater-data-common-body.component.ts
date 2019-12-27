import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mater-data-common-body',
  templateUrl: './mater-data-common-body.component.html'
})
export class MaterDataCommonBodyComponent implements OnInit {

  @Input() primaryData: any;
  @Input() secondaryData: any;
  @Input() fields: any;

  @Input() primaryLang: string;
  @Input() secondaryLang: string;

  languageNames = {
    ara: 'عربى',
    fra: 'French',
    eng: 'English'
  };
  showSecondaryForm: boolean;

  constructor() { }

  ngOnInit() {
    this.primaryLang === this.secondaryLang ? this.showSecondaryForm = false : this.showSecondaryForm = true;
    console.log(this.primaryData, this.secondaryData, this.fields);
  }

}
