
export class MachineSpecsModel {
    constructor(
        public name: string,
        public brand: string,
        public model: string,
        public machineTypeCode: string,
        public minDriverversion: string,
        public description: string,
        public langCode: string,        
        public isActive?: boolean,
        public id?: string,
    ) {}
}