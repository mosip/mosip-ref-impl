import { Pipe, PipeTransform } from '@angular/core';
import { AppConfigService } from 'src/app/app-config.service';
@Pipe({ name: 'status' })
export class StatusPipe implements PipeTransform {
  constructor(private appService: AppConfigService) {}
  transform(value) {
   if (value === true || value === 'true') {
      if (this.appService.getConfig().primaryLangCode === 'eng' || this.appService.getConfig().primaryLangCode === 'fra' ) {
        return 'Active';
      } else if (this.appService.getConfig().primaryLangCode === 'ara') {
        return 'نشيط';
      }
    } else if (value === false || value === 'false') {
      if (this.appService.getConfig().primaryLangCode === 'eng' || this.appService.getConfig().primaryLangCode === 'fra' ) {
        return 'Inactive';
      } else if (this.appService.getConfig().primaryLangCode === 'ara') {
        return 'غير نشط';
      }
    } else {
      return value;
    }
  }
  }
