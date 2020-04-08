
export class HolidaySpecsModel {
    constructor(
        public holidayDate: string,
		public holidayName: string,
		public holidayDesc: string,
		public newHolidayDate: string,
		public newHolidayName: string,
		public newHolidayDesc: string,
		public locationCode: string,
		public langCode: string,        
		public isActive?: boolean,
		public id?: string
    ) {}
}