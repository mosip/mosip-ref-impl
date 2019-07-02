import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Component, OnInit, Inject} from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit {

  input;
  confirm = true;
  Property = false;

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<DialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.input = this.data;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
