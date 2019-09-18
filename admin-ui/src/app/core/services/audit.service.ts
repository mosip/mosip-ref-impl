import { Injectable } from '@angular/core';
import { HeaderService } from './header.service';
import { DataStorageService } from './data-storage.service';
import { AuditModel } from '../models/audit-model';

@Injectable({
  providedIn: 'root'
})

export class AuditService {

  constructor(
    private headerService: HeaderService,
    private dataStorageService: DataStorageService
  ) {}

  audit(itemCode: string, data?: any) {
    const auditObject = new AuditModel();
    auditObject.createdBy = this.headerService.getUsername();
    auditObject.sessionUserId = this.headerService.getUsername();
    auditObject.sessionUserName = this.headerService.getUsername();
    switch (itemCode) {
    }
  }

}

