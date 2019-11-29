import { Component, OnInit } from '@angular/core';
import { AuditService } from 'src/app/core/services/audit.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  constructor(private auditService: AuditService) { }

  ngOnInit() {
    this.auditService.audit(3, 'ADM-042', 'users');
  }

}
