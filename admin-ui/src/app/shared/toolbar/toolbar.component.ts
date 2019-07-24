import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatPaginatorIntl, MatDialog } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';
import { Router } from '@angular/router';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent extends MatPaginatorIntl implements OnInit {
  @Input() buttonList: any;
  @Input() paginationOptions: any;
  @Output() pageEvent = new EventEmitter();
  lang: string;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private appConfig: AppConfigService
  ) {
    super();
    this.itemsPerPageLabel = 'Show rows';
  }

  ngOnInit() {
    this.lang = this.appConfig.getConfig().primaryLangCode;
  }

  actionEvent(buttonAction) {
    console.log(buttonAction);
    if (buttonAction.actionListType === 'action') {
      console.log(buttonAction.actionListType);
      this.openFilterDialog(buttonAction.actionURL);
    }
    if (buttonAction.actionListType === 'redirect') {
      console.log(buttonAction.actionListType);
      this.router.navigateByUrl(buttonAction.redirectURL);
    }
  }
  openFilterDialog(action): void {
    const dialogRef = this.dialog
      .open(DialogComponent, {
        data: action,
        width: '700px',
        height: '33em'
      })
      .afterClosed()
      .subscribe(result => {
        console.log('dislog is closed');
      });
  }
  onPaginateChange(event: Event) {
    console.log(event);
    this.pageEvent.emit(event);
  }
}
