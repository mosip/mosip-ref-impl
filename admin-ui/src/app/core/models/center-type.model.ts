
export class CenterTypeModel {
    constructor(
        public code: string,
        public langCode: string,
        public name: string,
        public descr: string,
        public isActive?: boolean,
        public id?: string,
    ) {}
}

