import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from 'src/app/core/services/header.service';
@Pipe({ name: 'status' })
export class StatusPipe implements PipeTransform {
  constructor(private translateService: TranslateService, private headerService: HeaderService) {}
  transform(value) {
    let displayValue = null;
    displayValue = this.translateService.use(this.headerService.getUserPreferredLanguage());
    if(value === true || value === 'true'){
      return displayValue.value.isActive.Active;
    }else if (value === false || value === 'false'){
      return displayValue.value.isActive.InActive;
    }else{
      return value;
    }  
  }
}
