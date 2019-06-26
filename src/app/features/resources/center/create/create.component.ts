import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { DataStorageService } from 'src/app/core/services/data-storage.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent implements OnInit {

  secondaryLanguageLabels: any;

  constructor(private location: Location,
              private translateService: TranslateService,
              private dataStorageService: DataStorageService) {
    translateService.use('eng');
  }

  ngOnInit() {
    this.dataStorageService.getLanguageSpecificLabels('ara').subscribe(response => {
      this.secondaryLanguageLabels = response.center;
      console.log(this.secondaryLanguageLabels);
    });
  }

  naviagteBack() {
    this.location.back();
  }

}
