
export class IndividualTypeModel {
    constructor(
        public code: string,
        public name: string,
        public langCode: string,        
        public isActive?: boolean,
        public id?: string,
    ) {}
}