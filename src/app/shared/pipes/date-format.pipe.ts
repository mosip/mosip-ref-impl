import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'formatDate' })


export class DateFormatPipe implements PipeTransform {
  transform(value): string {
    if (value === '-') {
      return value;
    } else {
       const d = new Date(value);
       const dateString = d.getDate() + ' ' + d.toLocaleString('en-US', {month: 'long'}) + ' ' + d.getFullYear();
       return dateString;
    }
  }
}
