import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'status' })
export class StatusPipe implements PipeTransform {
  transform(value): string {
    if (value === true) {
      return 'Active';
    } else if (value === false) {
      return 'Inactive';
    } else {
       return value;
    }
  }
}
