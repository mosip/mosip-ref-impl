export class CenterDropdown {
    constructor(
    public centerTypeCode: any = {},
    public region: any = {},
    public city: any = {},
    public province: any = {},
    public laa: any = {},
    public postalCode: any = {},
    public zone: any = {},
    public holidayZone: any = {},
    public workingHours: any = {},
    public noKiosk: any = {},
    public processingTime: any = {},
    public startTime: any = {},
    public endTime: any = {},
    public lunchStartTime: any = [],
    public lunchEndTime: any = [],
    public deviceTypeCode: any = {},
    public machineTypeCode: any = {},
    public fileFormatCode: any = {},
    public templateTypeCode: any = {},
    public moduleId: any = {},    
    public hierarchyLevelCode: any = {},
    public isActive = [true, false],
    public regCenterCode: any = {},
    public locationCode: any = {}
  ) {}
}