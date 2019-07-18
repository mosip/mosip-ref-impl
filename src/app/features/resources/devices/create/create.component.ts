import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent implements OnInit, OnDestroy {

  primaryForm: FormGroup;
  secondaryForm: FormGroup;

  subscribed: any;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
                this.subscribed = router.events.subscribe(event => {
                  if (event instanceof NavigationEnd) {
                    this.getData();
                  }
                });
              }

  ngOnInit() {
    this.initializePrimaryForm();
    this.initializeSecondaryForm();
  }

  initializePrimaryForm() {
    this.primaryForm = this.formBuilder.group({
      name: [''],
      serialNumber: [''],
      macAddress: [''],
      ipAddress: [''],
      validity: [''],
      isActive: ['']
    });
    this.primaryForm.disable();
  }

  initializeSecondaryForm() {
    this.secondaryForm = this.formBuilder.group({
      name: [''],
      serialNumber: [''],
      macAddress: [''],
      ipAddress: [''],
      validity: [''],
      isActive: ['']
    });
    this.secondaryForm.disable();
  }

  getData() {
    this.activatedRoute.params.subscribe(response => console.log(response.id));
  }

  ngOnDestroy() {
    this.subscribed.unsubscribe();
  }

}
