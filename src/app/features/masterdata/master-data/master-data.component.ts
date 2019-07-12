import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataStorageService } from 'src/app/core/services/data-storage.service';

@Component({
  selector: 'app-master-data',
  templateUrl: './master-data.component.html',
  styleUrls: ['./master-data.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MasterDataComponent implements OnInit {

  masterDataCommonList: any[];
  masterDataDeviceList: any[];
  masterDataMachineList: any[];
  masterDataDocumentList: any[];

  constructor(private dataService: DataStorageService) { }

  ngOnInit() {
    this.dataService.getMasterDataTypesList().subscribe(data => {
      console.log('Master Data', data);
      this.masterDataCommonList = data.masterDatatList.common;
      this.masterDataDeviceList = data.masterDatatList.deviceDefinition;
      this.masterDataMachineList = data.masterDatatList.machineDefinition;
      this.masterDataDocumentList = data.masterDatatList.documentDefinition;
      console.log('Master Data', this.masterDataDeviceList);
    });
  }

}
