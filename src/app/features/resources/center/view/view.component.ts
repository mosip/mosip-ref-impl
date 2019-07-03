import { Component, OnInit } from '@angular/core';
import { DataStorageService } from 'src/app/core/services/data-storage.service';


@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  constructor(private dataStroageService: DataStorageService) {}
  displayedColumns: [];
  actionButtons: [];
  actionEllipsis: [];
  paginatorOptions: any;
  centers = [];
  ngOnInit() {
    this.dataStroageService
      .getCenterSpecificLabelsAndActions()
      .subscribe(({ eng }) => {
        console.log(eng.columnsToDisplay);
        this.displayedColumns = eng.columnsToDisplay;
        console.log(this.displayedColumns);
        this.actionButtons = eng.actionButtons.filter(
          value => value.showIn.toLowerCase() === 'ellipsis'
        );
        this.actionEllipsis = eng.actionButtons.filter(
          value => value.showIn.toLowerCase() === 'button'
        );
        this.paginatorOptions = eng.paginator;
        console.log(this.paginatorOptions);
        console.log(this.actionEllipsis);
      });
    this.getCentersData();
  }

  getCentersData() {
    this.dataStroageService.getCentersData().subscribe(response => {
      this.centers = response;
      console.log(this.centers);
    });
  }

}
