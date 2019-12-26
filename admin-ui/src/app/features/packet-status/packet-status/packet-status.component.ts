import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';
import { AuditService } from 'src/app/core/services/audit.service';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';

@Component({
  selector: 'app-packet-status',
  templateUrl: './packet-status.component.html',
  styleUrls: ['./packet-status.component.scss']
})
export class PacketStatusComponent implements OnInit {
  data = [
    // {
    //   stageName: 'Virus Scan',
    //   date: '19 Jun 2019',
    //   time: '09:30',
    //   status: 'Completed'
    // }
  ];

  showDetails = false;
  showTimeline = false;
  errorMessages: any;

  id = '';
  error = false;

  constructor(
    private translate: TranslateService,
    private appService: AppConfigService,
    private auditService: AuditService,
    private dataStorageService: DataStorageService,
    public dialog: MatDialog
  ) {
    translate.use(appService.getConfig().primaryLangCode);
    this.translate
    .getTranslation(this.appService.getConfig().primaryLangCode)
    .subscribe(response => {
      console.log(response);
      this.errorMessages = response['packet-status'];
    });
  }

  ngOnInit() {

    this.auditService.audit(5, 'ADM-045');
  }

  search() {
    if (this.id.length !== 29) {
      this.error = true;
    } else {
      this.dataStorageService.getPacketStatus(this.id).subscribe(response => {
        console.log(response);
        if (response['response'] != null) {
          this.data = response['response']['packetStatusUpdateList'];
          this.error = false;
          this.showDetails = true;
        } else if (response['errors'] != null) {
          console.log('error has occured');
          this.dialog
            .open(DialogComponent, {
               data: {
                case: 'MESSAGE',
                title: this.errorMessages.errorMessages.title,
                message: this.errorMessages.errorMessages.message,
                btnTxt: this.errorMessages.errorMessages.btnTxt
               } ,
              width: '700px',
              disableClose: true
            })
            .afterClosed()
            .subscribe(result => {
              console.log('dialog is closed from view component');
            });
        }
      });
    }
  }

  viewMore() {
    this.showTimeline = !this.showTimeline;
  }
}
