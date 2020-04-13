
export class DocumentCategoriesModel {
    constructor(
        public code: string,
        public name: string,
        public description: string,
        public langCode: string,        
        public isActive?: boolean,
        public id?: string,
    ) {}
}