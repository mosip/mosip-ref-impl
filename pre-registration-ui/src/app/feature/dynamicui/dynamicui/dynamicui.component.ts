import { Component, OnInit } from '@angular/core';
import { DataStorageService } from 'src/app/core/services/data-storage.service';

@Component({
  selector: 'app-dynamicui',
  templateUrl: './dynamicui.component.html',
  styleUrls: ['./dynamicui.component.css']
})
export class DynamicuiComponent implements OnInit {

  constructor(private dataStorageService: DataStorageService) { }

  ngOnInit() {
  	this.getDynamicuiform();
  }

  getDynamicuiform() {
  	this.dataStorageService
      .getDynamicuiform()
      .subscribe(response => {
        console.log("response>>>",JSON.parse(JSON.stringify(response)).response.schema);
      });
  }

}
