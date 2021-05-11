import Utils from "src/app/app.util";

export class AuditModel {

    public eventName: string;
    public description: string;
    public actionUserId: string;

    constructor(
        public actionTimeStamp: string = Utils.getCurrentDate(),
        public moduleName: string = "PREREGISTRATION_UI",
        public moduleId: string = "PREREG_UI"
    ) {}
}