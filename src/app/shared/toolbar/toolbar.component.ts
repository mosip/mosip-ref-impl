import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatPaginatorIntl, MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { DialogComponent } from '../dialog/dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent extends MatPaginatorIntl implements OnInit {
  @Input() buttonList: any;
  @Input() paginationOptions: any;
  @Input() resourceFilter: any;
  @Output() pageEvent = new EventEmitter();

  constructor(public dialog: MatDialog, private router: Router) {
    super();
    this.itemsPerPageLabel = 'Show rows';
  }

  ngOnInit() {
  }
  iconDisplay(buttonName) {
    if (buttonName.toLowerCase() === 'filter') {
      return true;
    }
  }

  actionEvent(buttonAction) {
    console.log(buttonAction);
    if (buttonAction.actionListType === 'action') {
      console.log(buttonAction.actionListType);
      this.openFilterDialog();
    }
    if (buttonAction.actionListType === 'redirect') {
      console.log(buttonAction.actionListType);
      this.router.navigateByUrl( 'admin/resources/centers/create' );
    }

  }
  openFilterDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: this.resourceFilter,
      width: '700px',
      height: '30em',
    }).afterClosed().subscribe(result => {
      console.log(result + 'dislog is closed');
    }
      );
  }
  onPaginateChange(event: Event){
    console.log(event);
    this.pageEvent.emit(event);
  }
}
