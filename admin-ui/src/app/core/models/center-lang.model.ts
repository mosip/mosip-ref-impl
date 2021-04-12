export class CenterLangModel {
    constructor(
        public addressLine1: string,
        public addressLine2: string,
        public addressLine3: string,
        public contactPerson: string,
        public langCode: string,
        public name: string,
        public id?: string
    ) {}
}