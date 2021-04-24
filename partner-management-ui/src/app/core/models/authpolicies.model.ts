export class AuthPolicies {
    constructor(
        public authType: string,
        public authSubType: string,
        public mandatory: boolean
    ) {}
}
