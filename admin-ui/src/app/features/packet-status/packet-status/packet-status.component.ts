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
    // },
    // {
    //   stageName: 'Decrypt Packet',
    //   date: '19 Jun 2019',
    //   time: '12:10',
    //   status: 'Completed'
    // },
    // {
    //   stageName: 'Virus Scan',
    //   date: '19 Jun 2019',
    //   time: '13:20',
    //   status: 'Completed'
    // },
    // {
    //   stageName: 'Structural Validation',
    //   date: '19 Jun 2019',
    //   time: '13:30',
    //   status: 'Completed'
    // },
    // {
    //   stageName: 'Packet Data Validation',
    //   date: '20 Jun 2019',
    //   time: '12:30',
    //   status: 'Completed'
    // },
    // {
    //   stageName: 'Individual Data Validation',
    //   date: '20 Jun 2019',
    //   time: '14:30',
    //   status: 'In Progress'
    // },
    // {
    //   stageName: 'Demographic Deduplication',
    //   date: null,
    //   time: null,
    //   status: 'Incomplete'
    // },
    // {
    //   stageName: 'Biometric Deduplication',
    //   date: null,
    //   time: null,
    //   status: 'Incomplete'
    // },
    // {
    //   stageName: 'Manual Verification',
    //   date: null,
    //   time: null,
    //   status: 'Incomplete'
    // },
    // {
    //   stageName: 'UIN Generation',
    //   date: null,
    //   time: null,
    //   status: 'Incomplete'
    // },
    // {
    //   stageName: 'Notify Resident',
    //   date: null,
    //   time: null,
    //   status: 'Incomplete'
    // },
    // {
    //   stageName: 'Transmit Packet to Print Queue',
    //   date: null,
    //   time: null,
    //   status: 'Incomplete'
    // }
  ];

  showDetails = false;
  showTimeline = false;

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
                title: 'ERROR',
                message: response['errors']['message'],
                btnTxt: 'OK'
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
