
export class TemplateModel {
    constructor(
        public name: string,
        public description: string,
        public fileFormatCode: string,
        public model: string,
        public fileText: string,
        public moduleId: string,
        public moduleName: string,
        public templateTypeCode: string,
        public langCode: string,        
        public isActive?: boolean,
        public id?: string,
    ) {}
}