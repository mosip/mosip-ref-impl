import { HolidayModel } from './holiday-model';

export class CenterNonLangModel {
    constructor(
        public centerEndTime: string,
        public centerStartTime: string,
        public centerTypeCode: string,
        public contactPhone: string,
        public holidayLocationCode: string,
        public latitude: string,
        public locationCode: string,
        public longitude: string,
        public lunchEndTime: string,
        public lunchStartTime: string,
        public perKioskProcessTime: string,
        public timeZone: string,
        public workingHours: string,
        public zoneCode: string,
        public id?: string,
        public numberOfKiosks?: number,
        public workingNonWorkingDays?: any,
        public exceptionalHolidayPutPostDto?: HolidayModel[],
    ) {}
}