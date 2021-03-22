export class OptionalFilterValuesModel {
    constructor(
        public columnName: string,
        public type: string,
        public value?: string,
    ) {}
}
