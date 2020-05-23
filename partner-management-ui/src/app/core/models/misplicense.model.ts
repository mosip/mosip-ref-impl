export class MispLicenseModel{
    constructor(        
        public name : string,
        public address:string,
        public contactNumber:string,
        public emailId:string,
        public isActive:boolean,
        public id:string,
        public mispStatus:string,
        public validTo:string,
        public licenseStatus:boolean,
        public licenseKey:string
    ){}

    
}