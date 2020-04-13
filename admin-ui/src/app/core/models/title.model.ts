
export class TitleModel {
    constructor(
        public code: string,
        public titleName: string,
        public titleDescription: string,
        public langCode: string,        
        public isActive?: boolean,
        public id?: string,
    ) {}
}