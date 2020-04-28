
export class LocationModel {
    constructor(
        public hierarchyLevel: string,
        public hierarchyName: string,
        public parentLocCode: string,
        public langCode: string,        
        public isActive?: boolean,
        public id?: string,
    ) {}
}