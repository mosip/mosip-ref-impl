export class RequestModel {
    constructor(
        public id: string,
        public requestTime: string,
        public request: any,
        public version: string
    ) {}
}
