import {
  FormBuilder,
  FormControl,
  Validators,
  FormGroup
} from '@angular/forms';
export class CenterFilterForm {
  centerType: string;
  region: string;
  city: string;
  province: string;
  holidayZone: string;
  laa: string;
  status: string;
  postalCode: string;
  FilterGroup: FormGroup = null;
  constructor() {
    const builder = new FormBuilder();
    this.FilterGroup = builder.group({
      centerTypeName: [''],
      region: [''],
      city: [''],
      province: [''],
      holidayZone: [''],
      laa: [''],
      from: [''],
      to: [''],
      status: [''],
      postalcode: ['']
    });
  }
}
