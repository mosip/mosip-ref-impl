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
        public applicationName: string = 'Partner Management Portal',
    ) {}
}
