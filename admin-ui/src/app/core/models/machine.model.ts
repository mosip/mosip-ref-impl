
export class MachineModel {
    constructor(
        public zoneCode: string,
        public validityDateTime: string,
        public name: string,
        public machineSpecId: string,
        public macAddress: string,
        public serialNum: string,
        public ipAddress: string,
        public publicKey: string,
        public signPublicKey: string,
        public regCenterId: string,
        public id?: string,
        public isActive?: boolean,
    ) {}
}