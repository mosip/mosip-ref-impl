export class DeviceSpecification {
    constructor(
        public deviceSpecId: any = {},
        public brand : string,
        public description : string,
        public langCode: string,
        public deviceTypeCode: any = {},
        public minDriverversion: string,
        public model: string,
        public name: string,
        public id?: string,
        public isActive = [true, false]
  ) {}
}


