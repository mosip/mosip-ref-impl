import { Pipe, PipeTransform } from '@angular/core';
import { AppConfigService } from 'src/app/app-config.service';
@Pipe({ name: 'mapStatus' })
export class MapStatusPipe implements PipeTransform {
  constructor(private appService: AppConfigService) {}
  transform(value) {
    if (value === 'unassigned') {
      if (this.appService.getConfig().primaryLangCode === 'fra') {
        return 'Non attribué';
      } else if (this.appService.getConfig().primaryLangCode === 'ara') {
        return 'غير معين';
      } else if (this.appService.getConfig().primaryLangCode === 'eng') {
        return 'unassigned';
      }
    } else {
      return value;
    }
  }
}
