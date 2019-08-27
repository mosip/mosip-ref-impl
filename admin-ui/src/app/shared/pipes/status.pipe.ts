import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'status' })
export class StatusPipe implements PipeTransform {
  transform(value): string {
    if (value === true || value === 'true') {
      return 'Active';
    } else if (value === false || value === 'false') {
      return 'Inactive';
    } else {
       return value;
    }
  }
}
