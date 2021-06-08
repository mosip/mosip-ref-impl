import { DatePipe, registerLocaleData } from "@angular/common";
import * as appConstants from "./app.constants";
import localeEn from '@angular/common/locales/en';

export default class Utils {
  static getCurrentDate() {
    const now = new Date();
    const pipe = new DatePipe('en-US');
    let formattedDate = pipe.transform(now, 'yyyy-MM-ddTHH:mm:ss.SSS', 'UTC');
    formattedDate = formattedDate + 'Z';
    return formattedDate;
  }

  static getURL(currentURL: string, nextRoute: string, numberofPop = 2) {
    if (currentURL) {
      const urlSegments = currentURL.split('/');
      for (let index = 0; index < numberofPop; index++) {
        urlSegments.pop();
      }
      urlSegments.push(nextRoute);
      const url = urlSegments.join('/');
      return url;
    }
  }

  static async localeInitializer(localeId: string) {
    return new Promise(async function (resolve) {
      const module = await import(`@angular/common/locales/${localeId}.js`);
      registerLocaleData(module.default);
      localStorage.setItem(localeId, JSON.stringify(module.default));
      console.log(`registered localeId: ${localeId}`);
      resolve(true);
    })
  }

  static getBookingDateTime(appointment_date: string, time_slot_from: string, language: string) {
    let localeId = language.substring(0, 2);
    JSON.parse(localStorage.getItem("languageCodeValue")).forEach(
      (element) => {
        if (language === element.code && element.locale) {
          localeId = element.locale;
          if (localeId.indexOf("_") != -1) {
            localeId = localeId.split("_")[0];
          };      
        }
      }
    );  
    //console.log(`getBookingDateTime: ${localeId}`);
    const localeData = localStorage.getItem(localeId);
    let proceed = false;
    if (localeData !== null) {
      registerLocaleData(JSON.parse(localeData));
      //console.log(`registered localeId: ${localeId}`);
      proceed = true;
    } else {
      registerLocaleData(localeEn, 'en');
      proceed = true;
    }
    if (proceed) {
      const pipe = new DatePipe(localeId);
      const date = appointment_date.split("-");
      let appointmentDateTime =
        date[2] + " " + appConstants.MONTHS[Number(date[1])] + " " + date[0];
      appointmentDateTime = pipe.transform(appointmentDateTime, "MMM");
      date[1] = appointmentDateTime;
  
      if (language === "ara") {
        appointmentDateTime = date.join(" ");
      } else {
        appointmentDateTime = date.reverse().join(" ");
      }
      //console.log(appointmentDateTime);
      return appointmentDateTime;
    } else {
      return appointment_date;
    }
  }

  static formatTime(time_slot_from: string) {
    const time = time_slot_from.split(":");
    const appointmentDateTime =
      (Number(time[0]) > 12 ? Number(time[0]) - 12 : Number(time[0])) +
      ":" +
      time[1] +
      (Number(time[0]) >= 12 ? " PM" : " AM");
    return appointmentDateTime;
  }
}
