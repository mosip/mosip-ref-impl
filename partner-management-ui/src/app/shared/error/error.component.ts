import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  @Input() errorMessage: string;
  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.params.subscribe((message => this.errorMessage = message.errorMessage));
  }

  ngOnInit() {
  }

}
