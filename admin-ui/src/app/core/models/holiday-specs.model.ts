
export class HolidaySpecsModel {
    constructor(
        public holidayDate: string,
		public holidayName: string,
		public holidayDesc: string,
		public locationCode: string,
		public langCode: string,        
		public isActive?: boolean,
		public holidayId?: string
    ) {}
}