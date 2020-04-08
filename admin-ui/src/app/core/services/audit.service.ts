import { Injectable } from '@angular/core';
import { HeaderService } from './header.service';
import { AuditModel } from '../models/audit-model';
import { HttpClient } from '@angular/common/http';
import { RequestModel } from '../models/request.model';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  constructor(
    private headerService: HeaderService,
    private http: HttpClient,
    private appService: AppConfigService
  ) {}

  audit(type: number, eventID: string, data?: any) {
    const auditObject = new AuditModel();
    auditObject.eventId = eventID;
    auditObject.createdBy = this.headerService.getUsername();
    auditObject.sessionUserId = this.headerService.getUsername();
    auditObject.sessionUserName = this.headerService.getUsername();
    switch (type) {
      case 1: {
        auditObject.eventName = `Click: ${data}`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'ADM-NAV';
        auditObject.moduleName = 'Navigation';
        auditObject.description = `User clicked on ${data} on the Home Page`;
        break;
      }
      case 2: {
        auditObject.eventName = `Click: ${data} Masterdata`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel-masterdata';
        auditObject.description = `User clicked on ${data} on Masterdata Type Page`;
        break;
      }
      case 3: {
        auditObject.eventName = `Page View: ${data} list view`;
        auditObject.eventType = 'Navigation: Page View Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel-masterdata';
        auditObject.description = `User visited ${data} list view`;
        break;
      }
      case 4: {
        auditObject.eventName = `Page View: Masterdata Type page`;
        auditObject.eventType = 'Navigation: Page View Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel-masterdata';
        auditObject.description = `User visited Masterdata Type page`;
        break;
      }
      case 5: {
        auditObject.eventName = `Page View: Packet Status page`;
        auditObject.eventType = 'Navigation: Page View Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel-masterdata';
        auditObject.description = `User visited Packet Status page`;
        break;
      }
      case 6: {
        auditObject.eventName = `Page View: Home page`;
        auditObject.eventType = 'Navigation: Page View Event';
        auditObject.moduleId = 'ADM-NAV';
        auditObject.moduleName = 'Navigation';
        auditObject.description = `User visited Home page`;
        break;
      }
      case 7: {
        auditObject.eventName = `Click: ${data}`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User clicked on a ${data} on ${data} list view`;
        break;
      }
      case 8: {
        auditObject.eventName = `Page View: ${data} detail view`;
        auditObject.eventType = 'Navigation: Page View Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User visited ${data} detail view`;
        break;
      }
      case 9: {
        auditObject.eventName = `Click: ${data.buttonName} Button`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User clicked on ${data.buttonName} Button on ${data.masterdataName} list view`;
        break;
      }
      case 10: {
        auditObject.eventName = `Click: ${data.buttonName} Button`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User clicked on ${data.buttonName} Button on ${data.masterdataName} detail view`;
        break;
      }
      case 11: {
        auditObject.eventName = `Click: Cancel Filter Button`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User clicked on 'Cancel Filter' Button on ${data} list view`;
        break;
      }
      case 12: {
        auditObject.eventName = `Click: Apply Filter Button`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User applied filter on ${data}`;
        break;
      }
      case 13: {
        auditObject.eventName = `Click: Sort`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User sorted list of ${data.masterdataName} by column ${data.columnName}`;
        break;
      }
      case 14: {
        auditObject.eventName = `Click: Number of Rows per page dropdown`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User changed the no. of rows to ${data.noOfRows} on ${data.masterdataName} list view`;
        break;
      }
      case 15: {
        auditObject.eventName = `Click: Change Page`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User went to page ${data.pageNo} of ${data.masterdataName} List`;
        break;
      }
      case 16: {
        auditObject.eventName = `Page View: Center Create Form`;
        auditObject.eventType = 'Navigation: Page View Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User visited Center Create/Center Update form`;
        break;
      }
      case 17: {
        auditObject.eventName = `Click: Create/Update Center`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User clicked on 'Create/Update' button on Registration Center create form`;
        break;
      }
      case 18: {
        auditObject.eventName = `Click: Confirm ${data}`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User confirmed ${data} of a Registration Center`;
        break;
      }
      case 19: {
        auditObject.eventName = `Click: Cancel ${data}`;
        auditObject.eventType = 'Navigation: Click Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User cancelled ${data} of a Registration Center`;
        break;
      }
      case 20: {
        auditObject.eventName = `Page View: Device Create Form`;
        auditObject.eventType = 'Navigation: Page View Event';
        auditObject.moduleId = 'KER-MSD';
        auditObject.moduleName = 'Kernel Masterdata';
        auditObject.description = `User visited Device Create/Device Update form`;
        break;
      }
    }
    console.log(auditObject);
    this.postAuditLog(auditObject);
  }

  private postAuditLog(auditObject: AuditModel) {
    const request = new RequestModel('', null, auditObject);
    this.http.post(this.appService.getConfig().baseUrl + 'admin/auditmanager/log', request).subscribe(
      response => {
        console.log(response);
      },
      error => {
        console.log(error);
      }
    );
  }
}
