
/**
 * @description This class is base for Fetching Response from services
 * @author Urvil Joshi
 */
export class ResponseModel<T> {
    constructor(
        public id: string,
        public responsetime: string,
        public response: T,
        public version: string
    ) { }
}
