import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';
import { AuditService } from 'src/app/core/services/audit.service';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { HeaderService } from 'src/app/core/services/header.service';

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
  messages: any;
  statusCheck: string;

  id = '';
  error = false;
  errorMessage = '';
  constructor(
    private translate: TranslateService,
    private appService: AppConfigService,
    private auditService: AuditService,
    private dataStorageService: DataStorageService,
    private headerService: HeaderService,
    public dialog: MatDialog
  ) {
    translate.use(this.headerService.getUserPreferredLanguage());
    this.translate
    .getTranslation(this.headerService.getUserPreferredLanguage())
    .subscribe(response => {
      console.log(response);
      this.messages = response['packet-status'];
    });
  }

  ngOnInit() {
    this.auditService.audit(5, 'ADM-045');
  }

  search() {
    this.data = null;
    this.errorMessage = '';
    if (this.id.length == 0) {
      this.error = true;
    } else {
      this.error = false;
      this.dataStorageService.getPacketStatus(this.id).subscribe(response => {
        console.log(response);
        if (response['response'] != null) {
          this.data = response['response']['packetStatusUpdateList'];
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0 ; i < this.data.length; i++) {
            if (this.data[i].statusCode.includes('FAILED')) {
              this.statusCheck = this.messages.statuscheckFailed;
              break;
            } else {
              this.statusCheck = this.messages.statuscheckCompleted;
            }
            this.error = false;
            this.showDetails = true;
        }
       } else if (response['errors'] != null) {
          this.error = true;
          this.errorMessage = response['errors'][0].message;
          /*this.dialog
            .open(DialogComponent, {
               data: {
                case: 'MESSAGE',
                title: this.messages.errorMessages.title,
                message: this.messages.errorMessages.message,
                btnTxt: this.messages.errorMessages.btnTxt
               } ,
              width: '700px',
              disableClose: true
            })
            .afterClosed()
            .subscribe(result => {
              console.log('dialog is closed from view component');
            });*/
        }
      });
    }
  }

viewMore() {
    this.showTimeline = !this.showTimeline;
  }
}
