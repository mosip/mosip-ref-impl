import { DatePipe } from '@angular/common';
import { SortModel } from './core/models/sort.model';
import { PaginationModel } from './core/models/pagination.model';
import { FilterModel } from './core/models/filter.model';
import { CenterRequest } from './core/models/centerRequest.model';
import { CenterRequestNoLang } from './core/models/centerRequestNoLang.model';

export default class Utils {

  static formatDate(date: Date) {
    const pipe = new DatePipe('en-US');
    const formattedDate = pipe.transform(date, 'yyyy-MM-dd');
    return formattedDate;
  }

  static createDateObject(date: string) {
    let dateParts = date.split('-');
    dateParts = dateParts.reverse();
    return new Date(dateParts.join('-'));
  }


  static getCurrentDate() {
    const now = new Date();
    const pipe = new DatePipe('en-US');
    let formattedDate = pipe.transform(now, 'yyyy-MM-ddTHH:mm:ss.SSS');
    formattedDate = formattedDate + 'Z';
    return formattedDate;
  }
  static getTimeSlots(interval: number): string[] {
    const intervalInHours = interval / 60;
    const slots = [];
    for (let i = 0; i < 24; i += intervalInHours) {
      let time = Math.floor(i) < 10 ? '0' + Math.floor(i) : Math.floor(i);
      time += ':' + ((i % 1) * 60 < 10 ? '0' + (i % 1) * 60 : (i % 1) * 60);
      slots.push(this.convertTimeTo12Hours(time));
    }
    return slots;
  }

  static minuteIntervals(
    start: number,
    end: number,
    interval: number
  ): number[] {
    const intervals = [];
    for (let i = start; i <= end; i += interval) {
      intervals.push(i);
    }
    return intervals;
  }

  static getTimeInSeconds(time: string) {
    const pm = time.split(' ')[1].toLowerCase() === 'pm' ? true : false;
    let timeInSeconds = 0;
    if (!pm) {
      const hours = Number(time.split(' ')[0].split(':')[0]) % 12;
      const minutes = Number(time.split(' ')[0].split(':')[1]);
      timeInSeconds += hours * 3600 + minutes * 60;
    } else {
      const hours = (Number(time.split(' ')[0].split(':')[0]) % 12) + 12;
      const minutes = Number(time.split(' ')[0].split(':')[1]);
      timeInSeconds += hours * 3600 + minutes * 60;
    }
    return timeInSeconds;
  }

  static convertTime(time: string) {
    if (time === '' || time === undefined || time === null) {
      return '00:00:00';
    }
    const d = this.getTimeInSeconds(time);
    const h = Math.floor(d / 3600) < 10 ? '0' + Math.floor(d / 3600) : Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60) < 10 ? '0' + Math.floor(d % 3600 / 60) : Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60) < 10 ? '0' + Math.floor(d % 3600 % 60) : Math.floor(d % 3600 % 60);
    return h + ':' + m + ':' + s;
  }

  static convertTimeTo12Hours(time: string | number) {
    const timeString12hr = new Date(
      '1970-01-01T' + time + 'Z'
    ).toLocaleTimeString('en-US', {
      timeZone: 'UTC',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric'
    });
    return timeString12hr;
  }

  static convertFilter(queryParams: any, language: string): CenterRequest {
    const filterFields = Object.keys(queryParams).filter(field => field !== 'sort' && field !== 'pagination');
    const searchModel = new CenterRequest(
      this.filterFactory(queryParams, filterFields),
      this.sortFactory(queryParams.sort ? queryParams.sort : []),
      this.paginationFactory(queryParams.pagination ? queryParams.pagination : ''),
      language
    );
    return searchModel;
  }

  static convertFilterNoLang(queryParams: any): CenterRequestNoLang {
    const filterFields = Object.keys(queryParams).filter(field => field !== 'sort' && field !== 'pagination');
    const searchModel = new CenterRequestNoLang(
      this.filterFactory(queryParams, filterFields),
      this.sortFactory(queryParams.sort ? queryParams.sort : []),
      this.paginationFactory(queryParams.pagination ? queryParams.pagination : '')
    );
    return searchModel;
  }

  private static filterFactory(queryParams: any, filterFields: string[]): FilterModel[] {
    const pattern = /[\\:](contains|equals|startsWith|between)$/;
    const filters = [];
    filterFields.forEach(field => {
      if (pattern.test(queryParams[field])) {
        const filterParts = queryParams[field].split(':');
        switch (filterParts[1]) {
          case 'between': {
            if (/^.+[\\$].+/.test(filterParts[0])) {
              const values = filterParts[0].split('$');
              const filterModel = new FilterModel(field, filterParts[1], '', values[0], values[1]);
              filters.push(filterModel);
            }
            break;
          }
          default: {
            console.log(filterParts[0]);
            // if (/^[0-9a-zA-Z]{1,}/.test(filterParts[0])) {
            const filterModel = new FilterModel(field, filterParts[1], filterParts[0]);
            filters.push(filterModel);
            // }
            break;
          }
        }
      }
    });
    return filters;
  }

  private static sortFactory(sortData: any): SortModel[] {
    const pattern = /^[A|D][\\:][a-zA-Z0-9]{1,}$/;
    const sortObjectArray = [];
    if (typeof(sortData) === 'string') {
      sortData = [sortData];
    }
    sortData.forEach((element: string) => {
      if (pattern.test(element)) {
        const sortObject = new SortModel();
        const dataParts = element.split(':');
        if (dataParts[0] === 'A') {
          sortObject.sortType = 'ASC';
        } else if (dataParts[0] === 'D') {
          sortObject.sortType = 'DESC';
        } else {
          sortObject.sortType = '';
        }
        sortObject.sortField = dataParts[1] ? dataParts[1] : '';
        sortObjectArray.push(sortObject);
      }
    });
    return sortObjectArray;
  }

  private static paginationFactory(pageData: string): PaginationModel {
    const pattern = /[s][0-9]{1,}[\\:][f][0-9]{1,}/;
    const paginationModel = new PaginationModel();
    if (pattern.test(pageData)) {
      const pageDataParts = pageData.split(':');
      if (pageDataParts[0].charAt(0) === 's' && pageDataParts[0].length > 1) {
        if (!isNaN(Number(pageDataParts[0].substring(1)))) {
          paginationModel.pageStart = Number(pageDataParts[0].substring(1));
        }
      }
      if (pageDataParts[1].charAt(0) === 'f' && pageDataParts[1].length > 1) {
        if (!isNaN(Number(pageDataParts[1].substring(1)))) {
          paginationModel.pageFetch = Number(pageDataParts[1].substring(1));
        }
      }
    }
    return paginationModel;
  }

  static convertFilterToUrl(filterObject: CenterRequest): string {
    let url = '';
    url += `pagination=s${filterObject.pagination.pageStart}:f${filterObject.pagination.pageFetch}`;
    filterObject.sort.forEach(element => {
      url += `&sort=${element.sortType.toLowerCase() === 'asc' ? 'A' : 'D'}:${element.sortField}`;
    });
    filterObject.filters.forEach(filter => {
      if (filter.type === 'between') {
        url += `&${filter.columnName}=${filter.fromValue}$${filter.toValue}:${filter.type}`;
      } else {
        const filterValue = encodeURIComponent(filter.value);
        url += `&${filter.columnName}=${filterValue}:${filter.type}`;
      }
    });
    return url;
  }
}
