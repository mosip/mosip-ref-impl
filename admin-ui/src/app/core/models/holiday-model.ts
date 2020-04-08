export class HolidayModel {

    constructor(
        public exceptionHolidayDate: string,
        public exceptionHolidayName: string = '',
        public exceptionHolidayReson: string = ''
    ) {}
}