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
  from: string;
  to: string;
  status: string;
  postalCode: string;
  centerFilterGroup: FormGroup = null;
  constructor() {
    const builder = new FormBuilder();
    this.centerFilterGroup = builder.group({
      centerType: [''],
      region: [''],
      city: [''],
      province: [''],
      holidayZone: [''],
      laa: [''],
      from: [''],
      to: [''],
      status: [''],
      postalCode: ['']
    });
  }
}
