
export class MasterdatauploadModel {
    constructor(
        public transcationId?: string,
        public tableName?: string,
        public operation?: string,
        public count?: number,
        public status?: string,
        public uploadedBy?: string,
        public timeStamp?: string,
        public logs?: any        
    ) {}
}