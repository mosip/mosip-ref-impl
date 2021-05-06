
export class DeviceModel {
    constructor(
        public zoneCode: string,
        public name: string,
        public macAddress: string,
        public serialNum: string,
        public deviceSpecId: string,
        public validityDateTime?: string,
        public ipAddress?: string,
        public regCenterId?: string,
        public id?: string,
        public isActive?: boolean,
    ) {}
}
