import moment from "moment";

export class AuditModel {

    public eventName: string;
    public description: string;
    public actionUserId: string;

    constructor(
        public actionTimeStamp: any = new Date().toLocaleString("en-US", {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone}),
        public moduleName: string = "PREREGISTRATION_UI",
        public moduleId: string = "PREREG_UI"
    ) {}
}