
export class DeviceModel {
    constructor(
        public zoneCode: string,
        public validityDateTime: string,
        public name: string,
        public macAddress: string,
        public serialNum: string,
        public ipAddress: string,
        public langCode: string,
        public deviceSpecId: string,
        public regCenterId: string,
        public id?: string,
        public isActive?: boolean,
    ) {}
}
