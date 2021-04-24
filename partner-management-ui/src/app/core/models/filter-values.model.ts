export class FilterValuesModel {
    constructor(
        public columnName: string,
        public type: string,
        public text?: string,
    ) {}
}
