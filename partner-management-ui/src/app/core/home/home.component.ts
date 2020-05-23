import { Component, OnInit } from '@angular/core';
import { AuditService } from '../services/audit.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private auditService: AuditService) { }

  ngOnInit() {
    this.auditService.audit(6, 'ADM-046');
  }

}
