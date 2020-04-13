
export class GenderModel {
    constructor(
        public code: string,
        public genderName: string,
        public langCode: string,        
        public isActive?: boolean,
        public id?: string,
    ) {}
}