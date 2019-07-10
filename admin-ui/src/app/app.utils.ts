import { DatePipe } from '@angular/common';

export default class Utils {
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
}
