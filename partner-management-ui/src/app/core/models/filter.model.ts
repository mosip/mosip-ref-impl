export class FilterModel {
    constructor(
        public columnName: string,
        public type: string,
        public value?: string,
        public fromValue?: string,
        public toValue?: string
    ) {}
}
