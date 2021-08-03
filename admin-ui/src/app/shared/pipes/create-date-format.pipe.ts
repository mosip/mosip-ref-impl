import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({ name: 'createFormatDate' })


export class CreateDateFormatPipe implements PipeTransform {
  transform(value): string {
    if (value === '-') {
      return value;
    } else {
       return moment.utc(value, 'YYYY-MM-DD HH:mm:ss').local().format('YYYY-MM-DD hh:mm A');       
    }
  }
}
