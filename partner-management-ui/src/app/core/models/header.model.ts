export class HeaderModel {
    constructor(
        public name: string,
        public createdOn: string,
        public createdBy: string,
        public updatedOn: string,
        public updatedBy: string,
        public id?: string,
        public isActive?: string
    ) {}
}
