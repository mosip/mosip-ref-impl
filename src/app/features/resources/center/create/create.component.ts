import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent implements OnInit {

  secondaryLanguageLabels: any;

  constructor(private location: Location,
              private translateService: TranslateService,
              private dataStorageService: DataStorageService,
              private dialog: MatDialog) {
    translateService.use('eng');
  }

  ngOnInit() {
    this.dataStorageService.getLanguageSpecificLabels('ara').subscribe(response => {
      this.secondaryLanguageLabels = response.center;
      console.log(this.secondaryLanguageLabels);
    });
  }

  onCreate() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        case: 'CONFIRMATION',
        title: 'Confirmation',
        message: 'Click On yes To Create Center',
        yesBtnTxt: 'Yes',
        noBtnTxt: 'No'
      }
    });
    dialogRef.afterClosed().subscribe(response => {
      console.log('response', response);
    });
  }

  naviagteBack() {
    this.location.back();
  }

}
