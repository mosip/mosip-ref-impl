import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { CenterFilterForm } from 'src/app/core/validators/centerFilterForm';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogComponent implements OnInit {

  input;
  confirm = true;
  centerFilter: CenterFilterForm;
  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<DialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.input = this.data;
    console.log(this.input);
    this.settingUpCenterFilter();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  settingUpCenterFilter() {
   this.centerFilter = new CenterFilterForm();
}

getCenterFilterValuesOnSubmit() {
 console.log(this.centerFilter);
}

}
