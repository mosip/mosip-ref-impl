
export class DeviceSpecsModel {
    constructor(
        public name: string,
        public brand: string,
        public model: string,
        public deviceTypeCode: string,
        public minDriverversion: string,
        public description: string,
        public langCode: string,        
        public isActive?: boolean,
        public id?: string,
    ) {}
}