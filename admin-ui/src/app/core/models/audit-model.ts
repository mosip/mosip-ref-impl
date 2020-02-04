import Utils from 'src/app/app.utils';

export class AuditModel {

    public eventId: string;
    public eventName: string;
    public eventType: string;
    public moduleId: string;
    public moduleName: string;
    public description: string;
    public sessionUserId: string;
    public sessionUserName: string;
    public createdBy: string;

    constructor(
        public actionTimeStamp: string = Utils.getCurrentDate(),
        public applicationId: string = '10009',
        public applicationName: string = 'Admin Portal',
        public hostName: string = location.hostname,
        public hostIp: string = null,
        public idType: string = 'ADMIN',
        public id: string = 'NO_ID'
    ) {}
}
