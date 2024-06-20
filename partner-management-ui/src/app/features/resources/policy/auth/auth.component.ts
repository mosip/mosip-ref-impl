import { ElementRef, HostBinding, Component, OnInit, ViewChild, forwardRef, Input, Optional, Self, ChangeDetectorRef, OnChanges } from '@angular/core';
import { NgControl, FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteTrigger,MatFormFieldControl, MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';
import { FocusMonitor } from '@angular/cdk/a11y';
import { HeaderModel } from 'src/app/core/models/header.model';

export class ItemList {
  constructor(public item: string, public selected?: boolean) {
    if (selected === undefined) selected = false;
  }
}
@Component({
  selector: 'auth-app-table',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  disableForms: boolean;
  headerObject: HeaderModel;
  data = [];

  toppings = new FormControl();
  toppingList: string[] = ['OTP','DEMO','KYC','BIO'];

  constructor(

  ){
    this.initializeheader();
  }
  
  initializeheader() {
    if (this.data.length === 0) {
      this.headerObject = new HeaderModel('-', '-', '-', '-', '-', '-', '-');
    } else {
      this.headerObject = new HeaderModel(
        this.data[0].name,
        this.data[0].createdDateTime ? this.data[0].createdDateTime : '-',
        this.data[0].createdBy ? this.data[0].createdBy : '-',
        this.data[0].updatedDateTime ? this.data[0].updatedDateTime : '-',
        this.data[0].updatedBy ? this.data[0].updatedBy : '-',
        this.data[0].id,
        this.data[0].isActive
      );
    }
  }
}
